import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { type OAuthEnvBindings } from 'src/engine/core-modules/logic-function/logic-function-executor/types/oauth-env-bindings.type';
import { buildOAuthEnvVars } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-oauth-env-vars.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

const EMPTY_BINDING: OAuthEnvBindings = {
  accessToken: null,
  scopes: null,
  handle: null,
  connectedAccountId: null,
};

@Injectable()
export class LogicFunctionOAuthResolverService {
  private readonly logger = new Logger(LogicFunctionOAuthResolverService.name);

  constructor(
    private readonly oauthProviderService: ApplicationOAuthProviderService,
    private readonly refreshTokensService: ConnectedAccountRefreshTokensService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  // Builds the OAuth env vars to inject into a logic function's process.env.
  //
  // For per-workspace providers: looks up the single connection at the
  // workspace level. For per-user providers: requires `userWorkspaceId` to
  // identify the connection; emits CONNECTED=false otherwise so the function
  // can degrade gracefully when run without a user (cron, db events).
  async buildEnvVarsForApplication({
    applicationId,
    workspaceId,
    userWorkspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<Record<string, string>> {
    const providers = await this.oauthProviderService.findManyByApplication({
      applicationId,
      workspaceId,
    });

    if (providers.length === 0) {
      return {};
    }

    const accountsByProviderId = await this.findConnectedAccountsForProviders({
      providers,
      workspaceId,
      userWorkspaceId,
    });

    const bindings = await Promise.all(
      providers.map(async (provider) => ({
        providerName: provider.name,
        binding: await this.resolveBinding({
          provider,
          connectedAccount: accountsByProviderId.get(provider.id),
          workspaceId,
        }),
      })),
    );

    return buildOAuthEnvVars(
      Object.fromEntries(bindings.map((b) => [b.providerName, b.binding])),
    );
  }

  // Single batched lookup: per-user providers join on userWorkspaceId, per-
  // workspace providers join on workspaceId. We split the providers, run two
  // queries in parallel, then merge. With only per-user (or only per-
  // workspace) providers in an app, only one of the two queries runs.
  private async findConnectedAccountsForProviders({
    providers,
    workspaceId,
    userWorkspaceId,
  }: {
    providers: ApplicationOAuthProviderEntity[];
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<Map<string, ConnectedAccountEntity>> {
    const perUserIds: string[] = [];
    const perWorkspaceIds: string[] = [];

    for (const provider of providers) {
      if (provider.connectionMode === 'per-user') {
        perUserIds.push(provider.id);
      } else {
        perWorkspaceIds.push(provider.id);
      }
    }

    const [perUserAccounts, perWorkspaceAccounts] = await Promise.all([
      perUserIds.length > 0 && userWorkspaceId
        ? this.connectedAccountRepository.find({
            where: {
              applicationOAuthProviderId: In(perUserIds),
              userWorkspaceId,
            },
          })
        : [],
      perWorkspaceIds.length > 0
        ? this.connectedAccountRepository.find({
            where: {
              applicationOAuthProviderId: In(perWorkspaceIds),
              workspaceId,
            },
          })
        : [],
    ]);

    const accountsByProviderId = new Map<string, ConnectedAccountEntity>();

    for (const account of [...perUserAccounts, ...perWorkspaceAccounts]) {
      if (account.applicationOAuthProviderId) {
        accountsByProviderId.set(account.applicationOAuthProviderId, account);
      }
    }

    return accountsByProviderId;
  }

  private async resolveBinding({
    provider,
    connectedAccount,
    workspaceId,
  }: {
    provider: ApplicationOAuthProviderEntity;
    connectedAccount: ConnectedAccountEntity | undefined;
    workspaceId: string;
  }): Promise<OAuthEnvBindings> {
    if (!connectedAccount || connectedAccount.authFailedAt !== null) {
      return EMPTY_BINDING;
    }

    try {
      const tokens = await this.refreshTokensService.refreshAndSaveTokens(
        connectedAccount,
        workspaceId,
      );

      return {
        accessToken: tokens.accessToken,
        scopes: connectedAccount.scopes,
        handle: connectedAccount.handle,
        connectedAccountId: connectedAccount.id,
      };
    } catch (error) {
      this.logger.warn(
        `Failed to refresh tokens for connected account ${connectedAccount.id} (provider ${provider.id}): ${(error as Error).message}`,
      );

      return EMPTY_BINDING;
    }
  }
}
