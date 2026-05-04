import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type FindOptionsWhere, In, Repository } from 'typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { type AppConnectionDto } from 'src/engine/core-modules/application/application-oauth-provider/connections/dtos/app-connection.dto';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

type ListArgs = {
  applicationId: string;
  workspaceId: string;
  // The userWorkspaceId of the request initiator, when known. null for
  // cron / database-event triggers (the app is trusted to use its own
  // criteria when picking among workspace credentials).
  requestUserWorkspaceId: string | null;
  filter: {
    providerName?: string;
    userWorkspaceId?: string;
    visibility?: 'user' | 'workspace';
  };
};

type GetArgs = {
  applicationId: string;
  workspaceId: string;
  requestUserWorkspaceId: string | null;
  id: string;
};

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
  }: ListArgs): Promise<AppConnectionDto[]> {
    const providers = await this.oauthProviderRepository.find({
      where: { applicationId, workspaceId },
    });

    const providerById = new Map(providers.map((p) => [p.id, p]));

    let providerIds: string[] | undefined;

    if (isDefined(filter.providerName)) {
      const matching = providers.find((p) => p.name === filter.providerName);

      if (!matching) {
        return [];
      }
      providerIds = [matching.id];
    }

    const baseWhere: FindOptionsWhere<ConnectedAccountEntity> = {
      applicationId,
      workspaceId,
      provider: ConnectedAccountProvider.APP,
      ...(isDefined(providerIds)
        ? { applicationConnectionProviderId: In(providerIds) }
        : {}),
      ...(isDefined(filter.userWorkspaceId)
        ? { userWorkspaceId: filter.userWorkspaceId }
        : {}),
    };

    const accounts = await this.connectedAccountRepository.find({
      where: this.buildPrivacyWhere(
        baseWhere,
        requestUserWorkspaceId,
        filter.visibility,
      ),
    });

    const refreshed = await Promise.all(
      accounts.map((account) =>
        this.refreshAndMap(account, workspaceId, providerById),
      ),
    );

    return refreshed.filter(isDefined);
  }

  async getOne({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    id,
  }: GetArgs): Promise<AppConnectionDto> {
    const account = await this.connectedAccountRepository.findOne({
      where: {
        id,
        applicationId,
        workspaceId,
        provider: ConnectedAccountProvider.APP,
      },
    });

    if (!isDefined(account)) {
      throw new NotFoundException(`Connection ${id} not found`);
    }

    // Same privacy rule as list(): a request-user can only see their own
    // user-visibility credentials. Workspace-shared ones are visible to
    // anyone in the workspace. Cron has no request user — sees all.
    if (
      isDefined(requestUserWorkspaceId) &&
      account.visibility === 'user' &&
      account.userWorkspaceId !== requestUserWorkspaceId
    ) {
      throw new NotFoundException(`Connection ${id} not found`);
    }

    if (!isDefined(account.applicationConnectionProviderId)) {
      throw new NotFoundException(`Connection ${id} has no provider`);
    }

    const provider = await this.oauthProviderRepository.findOneByOrFail({
      id: account.applicationConnectionProviderId,
      workspaceId,
    });

    const dto = await this.refreshAndMap(
      account,
      workspaceId,
      new Map([[provider.id, provider]]),
    );

    if (!isDefined(dto)) {
      throw new NotFoundException(
        `Connection ${id} could not be refreshed; ask the user to reconnect`,
      );
    }

    return dto;
  }

  // Composes the caller's `visibility` filter with the per-request privacy
  // rule. Always returns a TypeORM where (single object = AND, array = OR)
  // so the caller doesn't have to branch.
  //
  // The earlier inline version OR'd `{ ...baseWhere, visibility: 'workspace' }`
  // with `{ ...baseWhere, userWorkspaceId: me }` regardless of caller intent,
  // which silently overrode an explicit `filter.visibility: 'user'` (the
  // first OR branch always returned workspace-shared rows).
  private buildPrivacyWhere(
    baseWhere: FindOptionsWhere<ConnectedAccountEntity>,
    requestUserWorkspaceId: string | null,
    visibilityFilter: 'user' | 'workspace' | undefined,
  ):
    | FindOptionsWhere<ConnectedAccountEntity>
    | FindOptionsWhere<ConnectedAccountEntity>[] {
    // Cron / DB-event triggers carry no user — the app is trusted to use
    // its own criteria, so honour the visibility filter as-is.
    if (!isDefined(requestUserWorkspaceId)) {
      return isDefined(visibilityFilter)
        ? { ...baseWhere, visibility: visibilityFilter }
        : baseWhere;
    }

    // Caller asked for user-visibility only → must be theirs.
    if (visibilityFilter === 'user') {
      return {
        ...baseWhere,
        visibility: 'user',
        userWorkspaceId: requestUserWorkspaceId,
      };
    }

    // Caller asked for workspace-shared only → no per-user restriction
    // (workspace-shared credentials are visible to everyone in the workspace).
    if (visibilityFilter === 'workspace') {
      return { ...baseWhere, visibility: 'workspace' };
    }

    // No visibility filter → return both: every workspace-shared row, plus
    // the request user's own user-visibility rows.
    return [
      { ...baseWhere, visibility: 'workspace' },
      {
        ...baseWhere,
        visibility: 'user',
        userWorkspaceId: requestUserWorkspaceId,
      },
    ];
  }

  private async refreshAndMap(
    account: ConnectedAccountEntity,
    workspaceId: string,
    providerById: Map<string, ApplicationOAuthProviderEntity>,
  ): Promise<AppConnectionDto | null> {
    const provider = isDefined(account.applicationConnectionProviderId)
      ? providerById.get(account.applicationConnectionProviderId)
      : undefined;

    // Connections without a resolvable provider can't be refreshed and the
    // app has no way to use them — drop them from the response so the dev
    // doesn't see ghost rows. The upstream cleanup happens via the FK
    // ON DELETE CASCADE when the provider is removed.
    if (!isDefined(provider)) {
      this.logger.warn(
        `Connection ${account.id} references missing provider ${account.applicationConnectionProviderId}`,
      );

      return null;
    }

    try {
      const tokens = await this.refreshTokensService.refreshAndSaveTokens(
        account,
        workspaceId,
      );

      return {
        id: account.id,
        providerName: provider.name,
        name: account.name ?? account.handle,
        handle: account.handle,
        visibility: account.visibility as 'user' | 'workspace',
        userWorkspaceId: account.userWorkspaceId,
        accessToken: tokens.accessToken,
        scopes: account.scopes ?? provider.scopes,
        authFailedAt: account.authFailedAt?.toISOString() ?? null,
      };
    } catch (error) {
      this.logger.warn(
        `Failed to refresh tokens for connection ${account.id}: ${(error as Error).message}`,
      );

      return null;
    }
  }
}
