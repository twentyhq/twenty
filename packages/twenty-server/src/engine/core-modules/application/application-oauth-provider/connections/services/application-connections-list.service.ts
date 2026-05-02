import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { type AppConnectionDto } from 'src/engine/core-modules/application/application-oauth-provider/connections/dtos/app-connection.dto';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

@Injectable()
export class ApplicationConnectionsListService {
  private readonly logger = new Logger(ApplicationConnectionsListService.name);

  constructor(
    private readonly refreshTokensService: ConnectedAccountRefreshTokensService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(ApplicationOAuthProviderEntity)
    private readonly oauthProviderRepository: Repository<ApplicationOAuthProviderEntity>,
  ) {}

  async list({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    filter,
  }: {
    applicationId: string;
    workspaceId: string;
    // The userWorkspaceId of the request initiator, when known. null for
    // cron / database-event triggers (the app is trusted to use its own
    // criteria when picking among workspace credentials).
    requestUserWorkspaceId: string | null;
    filter: {
      providerName?: string;
      userWorkspaceId?: string;
      scope?: 'user' | 'workspace';
    };
  }): Promise<AppConnectionDto[]> {
    let providerIds: string[] | undefined;

    if (isDefined(filter.providerName)) {
      const provider = await this.oauthProviderRepository.findOne({
        where: { applicationId, name: filter.providerName, workspaceId },
      });

      if (!provider) {
        return [];
      }
      providerIds = [provider.id];
    }

    const accounts = await this.connectedAccountRepository.find({
      where: {
        applicationId,
        workspaceId,
        provider: ConnectedAccountProvider.APP,
        ...(isDefined(providerIds)
          ? { applicationOAuthProviderId: In(providerIds) }
          : {}),
        ...(isDefined(filter.userWorkspaceId)
          ? { userWorkspaceId: filter.userWorkspaceId }
          : {}),
        ...(isDefined(filter.scope) ? { scope: filter.scope } : {}),
      },
    });

    // Privacy: when there's a request user, hide other users' user-scoped
    // credentials. Workspace-scoped credentials are always visible.
    const visibleAccounts = isDefined(requestUserWorkspaceId)
      ? accounts.filter(
          (a) =>
            a.scope === 'workspace' ||
            a.userWorkspaceId === requestUserWorkspaceId,
        )
      : accounts;

    // Provider name lookup for the response — one query covers all.
    const allProviderIds = Array.from(
      new Set(
        visibleAccounts
          .map((a) => a.applicationOAuthProviderId)
          .filter(isDefined),
      ),
    );

    const providers = await this.oauthProviderRepository.find({
      where: { id: In(allProviderIds) },
    });

    const providerNameById = new Map(providers.map((p) => [p.id, p.name]));

    const refreshed = await Promise.all(
      visibleAccounts.map(async (account) => {
        try {
          const tokens = await this.refreshTokensService.refreshAndSaveTokens(
            account,
            workspaceId,
          );

          return {
            account,
            accessToken: tokens.accessToken,
          };
        } catch (error) {
          this.logger.warn(
            `Failed to refresh tokens for connection ${account.id}: ${(error as Error).message}`,
          );

          return null;
        }
      }),
    );

    return refreshed.filter(isDefined).map(({ account, accessToken }) => ({
      id: account.id,
      name: account.name,
      scope: account.scope as 'user' | 'workspace',
      providerName:
        (account.applicationOAuthProviderId &&
          providerNameById.get(account.applicationOAuthProviderId)) ??
        '',
      userWorkspaceId: account.userWorkspaceId,
      accessToken,
      scopes: account.scopes ?? [],
      handle: account.handle === '' ? null : account.handle,
      lastRefreshedAt: account.lastCredentialsRefreshedAt?.toISOString() ?? null,
      authFailedAt: account.authFailedAt?.toISOString() ?? null,
    }));
  }

  async get({
    id,
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
  }: {
    id: string;
    applicationId: string;
    workspaceId: string;
    requestUserWorkspaceId: string | null;
  }): Promise<AppConnectionDto | null> {
    // Reuse list with an id filter via the underlying repo to keep the
    // privacy + refresh logic in one place.
    const account = await this.connectedAccountRepository.findOne({
      where: {
        id,
        applicationId,
        workspaceId,
        provider: ConnectedAccountProvider.APP,
      },
    });

    if (!account) {
      return null;
    }

    if (
      account.scope === 'user' &&
      isDefined(requestUserWorkspaceId) &&
      account.userWorkspaceId !== requestUserWorkspaceId
    ) {
      return null;
    }

    const provider = isDefined(account.applicationOAuthProviderId)
      ? await this.oauthProviderRepository.findOne({
          where: { id: account.applicationOAuthProviderId },
        })
      : null;

    let accessToken: string;

    try {
      const tokens = await this.refreshTokensService.refreshAndSaveTokens(
        account,
        workspaceId,
      );

      accessToken = tokens.accessToken;
    } catch (error) {
      this.logger.warn(
        `Failed to refresh tokens for connection ${account.id}: ${(error as Error).message}`,
      );

      return null;
    }

    return {
      id: account.id,
      name: account.name,
      scope: account.scope as 'user' | 'workspace',
      providerName: provider?.name ?? '',
      userWorkspaceId: account.userWorkspaceId,
      accessToken,
      scopes: account.scopes ?? [],
      handle: account.handle === '' ? null : account.handle,
      lastRefreshedAt: account.lastCredentialsRefreshedAt?.toISOString() ?? null,
      authFailedAt: account.authFailedAt?.toISOString() ?? null,
    };
  }
}
