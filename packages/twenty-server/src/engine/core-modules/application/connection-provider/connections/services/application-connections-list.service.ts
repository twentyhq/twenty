import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type FindOptionsWhere, In, Repository } from 'typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type AppConnectionDto } from 'src/engine/core-modules/application/connection-provider/connections/dtos/app-connection.dto';
import { isConnectionHiddenFromRequestUser } from 'src/engine/core-modules/application/connection-provider/connections/utils/is-connection-hidden-from-request-user.util';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  type ConnectedAccountTokens,
  ConnectedAccountRefreshTokensService,
} from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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

type RefreshAndMapArgs = {
  account: ConnectedAccountEntity;
  workspaceId: string;
  providerById: Map<string, ConnectionProviderEntity>;
  idByUserWorkspaceId: FlatWorkspaceMemberMaps['idByUserWorkspaceId'];
  findAuthorizedAccount: () => Promise<ConnectedAccountEntity | null>;
};

@Injectable()
export class ApplicationConnectionsListService {
  private readonly logger = new Logger(ApplicationConnectionsListService.name);

  constructor(
    private readonly refreshTokensService: ConnectedAccountRefreshTokensService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectWorkspaceScopedRepository(ConnectionProviderEntity)
    private readonly oauthProviderRepository: WorkspaceScopedRepository<ConnectionProviderEntity>,
  ) {}

  async list({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    filter,
  }: ListArgs): Promise<AppConnectionDto[]> {
    const providers = await this.oauthProviderRepository.find(workspaceId, {
      where: { applicationId },
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
        ? { connectionProviderId: In(providerIds) }
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

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const refreshed = await Promise.all(
      accounts.map((account) =>
        this.refreshAndMap({
          account,
          workspaceId,
          providerById,
          idByUserWorkspaceId: flatWorkspaceMemberMaps.idByUserWorkspaceId,
          findAuthorizedAccount: () =>
            this.connectedAccountRepository.findOne({
              where: this.buildPrivacyWhere(
                { ...baseWhere, id: account.id },
                requestUserWorkspaceId,
                filter.visibility,
              ),
            }),
        }),
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
    const findAuthorizedAccount = async () => {
      const account = await this.connectedAccountRepository.findOne({
        where: {
          id,
          applicationId,
          workspaceId,
          provider: ConnectedAccountProvider.APP,
        },
      });

      return isDefined(account) &&
        !isConnectionHiddenFromRequestUser({ account, requestUserWorkspaceId })
        ? account
        : null;
    };

    const account = await findAuthorizedAccount();

    if (!isDefined(account)) {
      throw new ConnectionProviderException(
        `Connection ${id} not found`,
        ConnectionProviderExceptionCode.CONNECTION_NOT_FOUND,
      );
    }

    if (!isDefined(account.connectionProviderId)) {
      throw new ConnectionProviderException(
        `Connection ${id} has no provider`,
        ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NOT_FOUND,
      );
    }

    const provider = await this.oauthProviderRepository.findOneOrFail(
      workspaceId,
      { where: { id: account.connectionProviderId } },
    );

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const dto = await this.refreshAndMap({
      account,
      workspaceId,
      providerById: new Map([[provider.id, provider]]),
      idByUserWorkspaceId: flatWorkspaceMemberMaps.idByUserWorkspaceId,
      findAuthorizedAccount,
    });

    if (!isDefined(dto)) {
      throw new ConnectionProviderException(
        `Connection ${id} could not be refreshed; ask the user to reconnect`,
        ConnectionProviderExceptionCode.REFRESH_FAILED,
      );
    }

    return dto;
  }

  private buildPrivacyWhere(
    baseWhere: FindOptionsWhere<ConnectedAccountEntity>,
    requestUserWorkspaceId: string | null,
    visibilityFilter: 'user' | 'workspace' | undefined,
  ):
    | FindOptionsWhere<ConnectedAccountEntity>
    | FindOptionsWhere<ConnectedAccountEntity>[] {
    if (!isDefined(requestUserWorkspaceId)) {
      return isDefined(visibilityFilter)
        ? { ...baseWhere, visibility: visibilityFilter }
        : baseWhere;
    }

    if (visibilityFilter === 'user') {
      return {
        ...baseWhere,
        visibility: 'user',
        userWorkspaceId: requestUserWorkspaceId,
      };
    }

    if (visibilityFilter === 'workspace') {
      return { ...baseWhere, visibility: 'workspace' };
    }

    return [
      { ...baseWhere, visibility: 'workspace' },
      {
        ...baseWhere,
        visibility: 'user',
        userWorkspaceId: requestUserWorkspaceId,
      },
    ];
  }

  private async refreshAndMap({
    account,
    workspaceId,
    providerById,
    idByUserWorkspaceId,
    findAuthorizedAccount,
  }: RefreshAndMapArgs): Promise<AppConnectionDto | null> {
    const provider = isDefined(account.connectionProviderId)
      ? providerById.get(account.connectionProviderId)
      : undefined;

    // Connections without a resolvable provider can't be refreshed and the
    // app has no way to use them — drop them from the response so the dev
    // doesn't see ghost rows. The upstream cleanup happens via the FK
    // ON DELETE CASCADE when the provider is removed.
    if (!isDefined(provider)) {
      this.logger.warn(
        `Connection ${account.id} references missing provider ${account.connectionProviderId}`,
      );

      return null;
    }

    try {
      const resolved = await this.resolveTokensForAuthorizedAccount({
        account,
        workspaceId,
        findAuthorizedAccount,
      });

      if (!isDefined(resolved)) {
        return null;
      }

      const { account: authorizedAccount, encryptedTokens } = resolved;

      return {
        id: authorizedAccount.id,
        providerName: provider.name,
        name: authorizedAccount.name ?? authorizedAccount.handle,
        handle: authorizedAccount.handle,
        visibility: authorizedAccount.visibility as 'user' | 'workspace',
        userWorkspaceId: authorizedAccount.userWorkspaceId,
        workspaceMemberId:
          idByUserWorkspaceId[authorizedAccount.userWorkspaceId] ?? null,
        accessToken: this.connectedAccountTokenEncryptionService.decrypt({
          ciphertext: encryptedTokens.accessToken,
          workspaceId,
        }),
        scopes: authorizedAccount.scopes ?? provider.oauthConfig?.scopes ?? [],
        authFailedAt: authorizedAccount.authFailedAt?.toISOString() ?? null,
        authFailedReason: authorizedAccount.authFailedReason,
      };
    } catch (error) {
      this.logger.warn(
        `Failed to refresh tokens for connection ${account.id}: ${(error as Error).message}`,
      );

      return null;
    }
  }

  // A refresh that lost to a concurrent write must not hand out credentials
  // the caller was never authorized for, so the row is re-read through the
  // caller's own privacy predicate, once.
  private async resolveTokensForAuthorizedAccount({
    account,
    workspaceId,
    findAuthorizedAccount,
  }: Pick<
    RefreshAndMapArgs,
    'account' | 'workspaceId' | 'findAuthorizedAccount'
  >): Promise<{
    account: ConnectedAccountEntity;
    encryptedTokens: ConnectedAccountTokens;
  } | null> {
    try {
      return {
        account,
        encryptedTokens: await this.refreshTokensService.resolveTokens(
          account,
          workspaceId,
        ),
      };
    } catch (error) {
      if (
        !(error instanceof ConnectedAccountRefreshAccessTokenException) ||
        error.code !==
          ConnectedAccountRefreshAccessTokenExceptionCode.CREDENTIALS_CHANGED_DURING_REFRESH
      ) {
        throw error;
      }
    }

    const authorizedAccount = await findAuthorizedAccount();

    if (!isDefined(authorizedAccount)) {
      return null;
    }

    return {
      account: authorizedAccount,
      encryptedTokens: await this.refreshTokensService.resolveTokens(
        authorizedAccount,
        workspaceId,
      ),
    };
  }
}
