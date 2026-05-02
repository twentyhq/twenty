import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type FindOptionsWhere, Repository } from 'typeorm';

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
    filter: { providerName?: string };
  }): Promise<AppConnectionDto[]> {
    let providerId: string | undefined;

    if (isDefined(filter.providerName)) {
      const provider = await this.oauthProviderRepository.findOne({
        where: { applicationId, name: filter.providerName, workspaceId },
      });

      if (!provider) {
        return [];
      }
      providerId = provider.id;
    }

    const baseWhere: FindOptionsWhere<ConnectedAccountEntity> = {
      applicationId,
      workspaceId,
      provider: ConnectedAccountProvider.APP,
      ...(isDefined(providerId)
        ? { applicationOAuthProviderId: providerId }
        : {}),
    };

    // Privacy: when there's a request user, hide other users' user-scoped
    // credentials. Workspace-scoped credentials are always visible. Pushing
    // this into SQL keeps the result set small for workspaces with many
    // user-scoped credentials.
    const where: FindOptionsWhere<ConnectedAccountEntity>[] = isDefined(
      requestUserWorkspaceId,
    )
      ? [
          { ...baseWhere, scope: 'workspace' },
          { ...baseWhere, userWorkspaceId: requestUserWorkspaceId },
        ]
      : [baseWhere];

    const accounts = await this.connectedAccountRepository.find({ where });

    const refreshed = await Promise.all(
      accounts.map(async (account) => {
        try {
          const tokens = await this.refreshTokensService.refreshAndSaveTokens(
            account,
            workspaceId,
          );

          return {
            id: account.id,
            scope: account.scope as 'user' | 'workspace',
            userWorkspaceId: account.userWorkspaceId,
            accessToken: tokens.accessToken,
            authFailedAt: account.authFailedAt?.toISOString() ?? null,
          };
        } catch (error) {
          this.logger.warn(
            `Failed to refresh tokens for connection ${account.id}: ${(error as Error).message}`,
          );

          return null;
        }
      }),
    );

    return refreshed.filter(isDefined);
  }
}
