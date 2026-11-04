import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type FindOptionsWhere, In, Repository } from 'typeorm';

import {
  CONNECTION_SCOPE_BY_LEGACY_VISIBILITY,
  LEGACY_CONNECTION_VISIBILITY_BY_SCOPE,
} from 'twenty-shared/application-runtime';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type AppConnectionDto } from 'src/engine/core-modules/application/connection-provider/connections/dtos/app-connection.dto';
import { isConnectionHiddenFromRequestUser } from 'src/engine/core-modules/application/connection-provider/connections/utils/is-connection-hidden-from-request-user.util';
import {
  ConnectedAccountEntity,
  type ConnectedAccountScope,
} from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
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
    scope?: ConnectedAccountScope;
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

    const scopeFilter =
      filter.scope ??
      (isDefined(filter.visibility)
        ? CONNECTION_SCOPE_BY_LEGACY_VISIBILITY[filter.visibility]
        : undefined);

    const accounts = await this.connectedAccountRepository.find({
      where: this.buildPrivacyWhere(
        baseWhere,
        requestUserWorkspaceId,
        scopeFilter,
      ),
    });

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const refreshed = await Promise.all(
      accounts.map((account) =>
        this.refreshAndMap(
          account,
          workspaceId,
          providerById,
          flatWorkspaceMemberMaps.idByUserWorkspaceId[
            account.userWorkspaceId
          ] ?? null,
        ),
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

    if (
      !isDefined(account) ||
      isConnectionHiddenFromRequestUser({ account, requestUserWorkspaceId })
    ) {
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

    const dto = await this.refreshAndMap(
      account,
      workspaceId,
      new Map([[provider.id, provider]]),
      flatWorkspaceMemberMaps.idByUserWorkspaceId[account.userWorkspaceId] ??
        null,
    );

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
    scopeFilter: ConnectedAccountScope | undefined,
  ):
    | FindOptionsWhere<ConnectedAccountEntity>
    | FindOptionsWhere<ConnectedAccountEntity>[] {
    if (!isDefined(requestUserWorkspaceId)) {
      return isDefined(scopeFilter)
        ? { ...baseWhere, scope: scopeFilter }
        : baseWhere;
    }

    if (scopeFilter === 'USER') {
      return {
        ...baseWhere,
        scope: 'USER',
        userWorkspaceId: requestUserWorkspaceId,
      };
    }

    if (scopeFilter === 'WORKSPACE') {
      return { ...baseWhere, scope: 'WORKSPACE' };
    }

    return [
      { ...baseWhere, scope: 'WORKSPACE' },
      {
        ...baseWhere,
        scope: 'USER',
        userWorkspaceId: requestUserWorkspaceId,
      },
    ];
  }

  private async refreshAndMap(
    account: ConnectedAccountEntity,
    workspaceId: string,
    providerById: Map<string, ConnectionProviderEntity>,
    workspaceMemberId: string | null,
  ): Promise<AppConnectionDto | null> {
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
      const connectionFields = {
        id: account.id,
        providerName: provider.name,
        name: account.name ?? account.handle,
        handle: account.handle,
        externalAccountId: account.externalAccountId,
        scope: account.scope,
        visibility: LEGACY_CONNECTION_VISIBILITY_BY_SCOPE[account.scope],
        userWorkspaceId: account.userWorkspaceId,
        workspaceMemberId,
        scopes: account.scopes ?? provider.oauthConfig?.scopes ?? [],
        authFailedAt: account.authFailedAt?.toISOString() ?? null,
        authFailedReason: account.authFailedReason,
      };

      if (provider.type === 'custom') {
        return {
          ...connectionFields,
          providerType: 'custom',
          accessToken: isDefined(account.accessToken)
            ? await this.decryptAccessToken({ account, workspaceId })
            : null,
        };
      }

      return {
        ...connectionFields,
        providerType: 'oauth',
        accessToken: await this.decryptAccessToken({ account, workspaceId }),
      };
    } catch (error) {
      this.logger.warn(
        `Failed to refresh tokens for connection ${account.id}: ${(error as Error).message}`,
      );

      return null;
    }
  }

  private async decryptAccessToken({
    account,
    workspaceId,
  }: {
    account: ConnectedAccountEntity;
    workspaceId: string;
  }): Promise<string> {
    const encryptedTokens = await this.refreshTokensService.resolveTokens(
      account,
      workspaceId,
    );

    return this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: encryptedTokens.accessToken,
      workspaceId,
    });
  }
}
