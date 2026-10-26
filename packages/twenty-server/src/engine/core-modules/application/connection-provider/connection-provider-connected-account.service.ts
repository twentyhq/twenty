import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type IdentifiedAccount } from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { extractEmailFromIdTokenClaims } from 'src/engine/core-modules/application/connection-provider/utils/extract-email-from-id-token-claims.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import {
  ConnectedAccountEntity,
  type ConnectedAccountScope,
} from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';

type ConnectedAccountCredentials = {
  accessToken: PlaintextString | null;
  refreshToken: PlaintextString | null;
  scopes: string[] | null;
};

@Injectable()
export class ConnectionProviderConnectedAccountService {
  constructor(
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly appConnectionAccessService: AppConnectionAccessService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async assertCallerCanConnectOrThrow({
    connectionProviderId,
    workspaceId,
    userWorkspaceId,
    scope,
    reconnectingConnectedAccountId,
  }: {
    connectionProviderId: string;
    workspaceId: string;
    userWorkspaceId: string;
    scope: ConnectedAccountScope;
    reconnectingConnectedAccountId: string | null;
  }): Promise<void> {
    await this.assertReconnectTargetUsableByCallerOrThrow({
      connectionProviderId,
      workspaceId,
      userWorkspaceId,
      reconnectingConnectedAccountId,
    });

    await this.appConnectionAccessService.validateCallerCanManageConnection({
      isWorkspaceShared: scope === 'WORKSPACE',
      workspaceId,
      userWorkspaceId,
    });
  }

  async resolveHandle({
    idToken,
    userId,
  }: {
    idToken: TokenExchangeResponse['idToken'];
    userId: string;
  }): Promise<string> {
    const idTokenEmail = isDefined(idToken)
      ? extractEmailFromIdTokenClaims(idToken)
      : null;

    if (isDefined(idTokenEmail)) {
      return idTokenEmail;
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!isDefined(user)) {
      throw new ConnectionProviderException(
        'User not found',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    return user.email;
  }

  async persist({
    provider,
    credentials,
    handle,
    identifiedAccount,
    workspaceId,
    userId,
    userWorkspaceId,
    scope,
    reconnectingConnectedAccountId,
  }: {
    provider: Pick<
      ConnectionProviderEntity,
      'id' | 'displayName' | 'applicationId'
    >;
    credentials: ConnectedAccountCredentials | undefined;
    handle: string | undefined;
    identifiedAccount: IdentifiedAccount | null;
    workspaceId: string;
    userId: string;
    userWorkspaceId: string;
    scope: ConnectedAccountScope;
    reconnectingConnectedAccountId: string | null;
  }): Promise<ConnectedAccountEntity> {
    const sharedFields = {
      ...(isDefined(credentials) && {
        accessToken:
          this.connectedAccountTokenEncryptionService.encryptNullable({
            plaintext: credentials.accessToken,
            workspaceId,
          }),
        refreshToken:
          this.connectedAccountTokenEncryptionService.encryptNullable({
            plaintext: credentials.refreshToken,
            workspaceId,
          }),
        scopes: credentials.scopes,
        lastCredentialsRefreshedAt: new Date(),
      }),
      ...(isDefined(handle) && { handle }),
      authFailedAt: null,
      authFailedReason: null,
      archivedAt: null,
      scope,
      externalAccountId: identifiedAccount?.externalAccountId ?? null,
    };

    if (isDefined(reconnectingConnectedAccountId)) {
      const reconnectTarget = {
        id: reconnectingConnectedAccountId,
        workspaceId,
      };

      // Compared and written in one statement so overlapping reconnects cannot pin different accounts.
      const updateResult = await this.connectedAccountRepository.update(
        isDefined(identifiedAccount)
          ? [
              { ...reconnectTarget, externalAccountId: IsNull() },
              {
                ...reconnectTarget,
                externalAccountId: identifiedAccount.externalAccountId,
              },
            ]
          : reconnectTarget,
        { ...sharedFields, userWorkspaceId },
      );

      const connectedAccount =
        await this.connectedAccountRepository.findOneByOrFail(reconnectTarget);

      if (updateResult.affected === 0 && isDefined(identifiedAccount)) {
        const authorizedAccountHandle =
          identifiedAccount.handle ?? identifiedAccount.externalAccountId;

        throw new ConnectionProviderException(
          `You authorized ${authorizedAccountHandle}, but this connection belongs to ${connectedAccount.handle}. Reconnect with ${connectedAccount.handle}, or add a new connection for ${authorizedAccountHandle}.`,
          ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_MISMATCH,
        );
      }

      return connectedAccount;
    }

    const existingCount = await this.connectedAccountRepository.count({
      where: { connectionProviderId: provider.id, workspaceId },
    });

    const name = `${provider.displayName} #${existingCount + 1}`;

    const created = this.connectedAccountRepository.create({
      ...sharedFields,
      handle: handle ?? (await this.resolveHandle({ idToken: null, userId })),
      name,
      scope,
      provider: ConnectedAccountProvider.APP,
      workspaceId,
      applicationId: provider.applicationId,
      connectionProviderId: provider.id,
      userWorkspaceId,
    });

    return this.connectedAccountRepository.save(created);
  }

  async findConnectedAccountForReport({
    provider,
    workspaceId,
    userWorkspaceId,
    externalAccountId,
    reconnectingConnectedAccountId,
  }: {
    provider: Pick<ConnectionProviderEntity, 'id'>;
    workspaceId: string;
    userWorkspaceId: string;
    externalAccountId: string;
    reconnectingConnectedAccountId: string | null;
  }): Promise<Pick<
    ConnectedAccountEntity,
    'id' | 'archivedAt' | 'authFailedAt'
  > | null> {
    return this.connectedAccountRepository.findOne({
      where: isDefined(reconnectingConnectedAccountId)
        ? {
            id: reconnectingConnectedAccountId,
            workspaceId,
            connectionProviderId: provider.id,
          }
        : {
            workspaceId,
            connectionProviderId: provider.id,
            userWorkspaceId,
            externalAccountId,
          },
      select: { id: true, archivedAt: true, authFailedAt: true },
    });
  }

  private async assertReconnectTargetUsableByCallerOrThrow({
    connectionProviderId,
    workspaceId,
    userWorkspaceId,
    reconnectingConnectedAccountId,
  }: {
    connectionProviderId: string;
    workspaceId: string;
    userWorkspaceId: string;
    reconnectingConnectedAccountId: string | null;
  }): Promise<void> {
    if (!isDefined(reconnectingConnectedAccountId)) {
      return;
    }

    const reconnectTarget = await this.connectedAccountRepository.findOne({
      where: buildConnectedAccountUsableByCallerWhere({
        baseWhere: {
          id: reconnectingConnectedAccountId,
          workspaceId,
          connectionProviderId,
        },
        userWorkspaceId,
      }),
    });

    if (!isDefined(reconnectTarget)) {
      throw new ConnectionProviderException(
        `Cannot reconnect connectedAccount ${reconnectingConnectedAccountId}: not found in this workspace for the requested provider, or not usable by this member.`,
        ConnectionProviderExceptionCode.FORBIDDEN,
      );
    }
  }
}
