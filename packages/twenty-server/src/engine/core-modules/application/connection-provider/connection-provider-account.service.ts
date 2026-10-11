import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ConnectionAccountIdentity } from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderIdentityService } from 'src/engine/core-modules/application/connection-provider/connection-provider-identity.service';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { type OAuthConnectionProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { assertConnectionProviderVisibilityAllowed } from 'src/engine/core-modules/application/connection-provider/utils/assert-connection-provider-visibility-allowed.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';

type SaveConnectionArgs = {
  provider: OAuthConnectionProvider;
  tokenResponse: TokenExchangeResponse;
  identity: ConnectionAccountIdentity | null;
  handle: string;
  workspaceId: string;
  userId: string;
  userWorkspaceId: string;
  visibility: 'user' | 'workspace';
  reconnectingConnectedAccountId: string | null;
};

@Injectable()
export class ConnectionProviderAccountService {
  constructor(
    private readonly connectionProviderIdentityService: ConnectionProviderIdentityService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly appConnectionAccessService: AppConnectionAccessService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async saveConnection(args: SaveConnectionArgs): Promise<{
    connectedAccount: ConnectedAccountEntity;
    wasReused: boolean;
  }> {
    const {
      provider,
      identity,
      tokenResponse,
      workspaceId,
      userId,
      userWorkspaceId,
      visibility,
      reconnectingConnectedAccountId,
    } = args;
    const legacyIdentity = await this.identifyLegacyReconnect(args);
    const { encryptedAccessToken, encryptedRefreshToken } =
      this.connectedAccountTokenEncryptionService.encryptTokenPair({
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        workspaceId,
      });

    return this.connectedAccountRepository.manager.transaction(
      async (entityManager) => {
        // A provider exists even before its first connection. Locking it makes
        // the first two callbacks serialize, including reconnect and sharing.
        const currentProvider = await entityManager.findOne(
          ConnectionProviderEntity,
          {
            where: {
              id: provider.id,
              workspaceId,
              applicationId: provider.applicationId,
            },
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (
          !isDefined(currentProvider) ||
          currentProvider.identifyAccountLogicFunctionUniversalIdentifier !==
            provider.identifyAccountLogicFunctionUniversalIdentifier
        ) {
          throw new ConnectionProviderException(
            'The connection provider changed during authorization. Start again.',
            ConnectionProviderExceptionCode.INVALID_STATE,
          );
        }

        const member = await entityManager.findOne(UserWorkspaceEntity, {
          where: { id: userWorkspaceId, userId, workspaceId },
          lock: { mode: 'pessimistic_read' },
        });

        if (!isDefined(member)) {
          throw new ConnectionProviderException(
            'The member no longer belongs to this workspace.',
            ConnectionProviderExceptionCode.FORBIDDEN,
          );
        }

        const repository = entityManager.getRepository(ConnectedAccountEntity);
        const reconnectTarget = isDefined(reconnectingConnectedAccountId)
          ? await repository.findOne({
              where: this.reconnectWhere(args),
              lock: { mode: 'pessimistic_write' },
            })
          : null;

        if (
          isDefined(reconnectingConnectedAccountId) &&
          !isDefined(reconnectTarget)
        ) {
          throw new ConnectionProviderException(
            'The connection can no longer be reconnected by this member.',
            ConnectionProviderExceptionCode.FORBIDDEN,
          );
        }

        await this.appConnectionAccessService.validateCallerCanManageConnection(
          {
            isWorkspaceShared:
              visibility === 'workspace' ||
              reconnectTarget?.visibility === 'workspace',
            workspaceId,
            userWorkspaceId,
          },
        );

        assertConnectionProviderVisibilityAllowed({
          provider: currentProvider,
          visibility,
          reconnectTarget,
        });

        if (
          reconnectTarget?.visibility === 'workspace' &&
          visibility === 'user'
        ) {
          throw new ConnectionProviderException(
            'Reconnect cannot make a shared connection personal.',
            ConnectionProviderExceptionCode.INVALID_REQUEST,
          );
        }

        if (isDefined(reconnectTarget)) {
          const previousIdentity =
            reconnectTarget.externalAccountId ??
            (legacyIdentity?.accessToken === reconnectTarget.accessToken
              ? legacyIdentity?.externalAccountId
              : null);

          if (
            (isDefined(identity) && !isDefined(previousIdentity)) ||
            (isDefined(previousIdentity) && !isDefined(identity))
          ) {
            throw this.unknownIdentity();
          }

          if (
            isDefined(identity) &&
            previousIdentity !== identity.externalAccountId
          ) {
            throw new ConnectionProviderException(
              'Reconnect resolved a different external account.',
              ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_MISMATCH,
            );
          }
        }

        const matchingAccount = isDefined(identity)
          ? await repository.findOne({
              where: {
                workspaceId,
                connectionProviderId: provider.id,
                provider: ConnectedAccountProvider.APP,
                externalAccountId: identity.externalAccountId,
                visibility,
                archivedAt: IsNull(),
                ...(visibility === 'user' ? { userWorkspaceId } : {}),
              },
              lock: { mode: 'pessimistic_write' },
            })
          : null;

        if (
          isDefined(reconnectTarget) &&
          isDefined(matchingAccount) &&
          reconnectTarget.id !== matchingAccount.id
        ) {
          throw new ConnectionProviderException(
            'Another active connection already represents this account with the requested visibility.',
            ConnectionProviderExceptionCode.ACCOUNT_ALREADY_CONNECTED,
          );
        }

        const existingAccount = reconnectTarget ?? matchingAccount;
        const credentials = {
          accessToken: encryptedAccessToken,
          refreshToken:
            encryptedRefreshToken ??
            (isDefined(identity) ? existingAccount?.refreshToken : null) ??
            null,
          externalAccountId: identity?.externalAccountId ?? null,
          handle: identity?.handle ?? args.handle,
          scopes: tokenResponse.scopes ?? provider.oauthConfig.scopes,
          lastCredentialsRefreshedAt: new Date(),
          authFailedAt: null,
          authFailedReason: null,
          archivedAt: null,
          visibility,
          userWorkspaceId,
        };

        if (isDefined(existingAccount)) {
          await repository.update(
            { id: existingAccount.id, workspaceId },
            credentials,
          );

          return {
            connectedAccount: await repository.findOneByOrFail({
              id: existingAccount.id,
              workspaceId,
            }),
            wasReused: !isDefined(reconnectTarget),
          };
        }

        const existingCount = await repository.count({
          where: { connectionProviderId: provider.id, workspaceId },
        });
        const connectedAccount = await repository.save(
          repository.create({
            ...credentials,
            name: `${provider.displayName} #${existingCount + 1}`,
            provider: ConnectedAccountProvider.APP,
            workspaceId,
            applicationId: provider.applicationId,
            connectionProviderId: provider.id,
          }),
        );

        return { connectedAccount, wasReused: false };
      },
    );
  }

  private reconnectWhere(args: SaveConnectionArgs) {
    return buildConnectedAccountUsableByCallerWhere({
      baseWhere: {
        id: args.reconnectingConnectedAccountId ?? '',
        workspaceId: args.workspaceId,
        connectionProviderId: args.provider.id,
        applicationId: args.provider.applicationId,
        provider: ConnectedAccountProvider.APP,
      },
      userWorkspaceId: args.userWorkspaceId,
    });
  }

  private async identifyLegacyReconnect(args: SaveConnectionArgs) {
    if (
      !isDefined(args.identity) ||
      !isDefined(args.reconnectingConnectedAccountId)
    ) {
      return null;
    }

    const target = await this.connectedAccountRepository.findOne({
      where: this.reconnectWhere(args),
    });

    if (!isDefined(target) || isDefined(target.externalAccountId)) {
      return null;
    }

    if (!isDefined(target.accessToken) || isDefined(target.archivedAt)) {
      throw this.unknownIdentity();
    }

    try {
      const identity =
        await this.connectionProviderIdentityService.identifyAccount({
          provider: args.provider,
          workspaceId: args.workspaceId,
          accessToken: this.connectedAccountTokenEncryptionService.decrypt({
            ciphertext: target.accessToken,
            workspaceId: args.workspaceId,
          }),
          scopes: target.scopes ?? args.provider.oauthConfig.scopes,
        });

      if (!isDefined(identity)) {
        throw this.unknownIdentity();
      }

      return {
        accessToken: target.accessToken,
        externalAccountId: identity.externalAccountId,
      };
    } catch {
      throw this.unknownIdentity();
    }
  }

  private unknownIdentity(): ConnectionProviderException {
    return new ConnectionProviderException(
      'The original connection identity cannot be verified.',
      ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_IDENTITY_UNKNOWN,
    );
  }
}
