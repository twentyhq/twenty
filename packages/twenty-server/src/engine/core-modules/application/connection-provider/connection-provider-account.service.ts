import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { type OAuthConnectionProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

type SaveConnectionArgs = {
  provider: OAuthConnectionProvider;
  tokenResponse: TokenExchangeResponse;
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
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly appConnectionAccessService: AppConnectionAccessService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async saveConnection(args: SaveConnectionArgs): Promise<{
    connectedAccount: ConnectedAccountEntity;
  }> {
    const {
      provider,
      tokenResponse,
      workspaceId,
      userWorkspaceId,
      visibility,
    } = args;

    return this.connectedAccountRepository.manager.transaction(
      async (entityManager) => {
        const { reconnectTarget } =
          await this.appConnectionAccessService.validateConnectionAccessOrThrow(
            {
              ...args,
              entityManager,
            },
          );
        const repository = entityManager.getRepository(ConnectedAccountEntity);
        const { encryptedAccessToken, encryptedRefreshToken } =
          this.connectedAccountTokenEncryptionService.encryptTokenPair({
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
            workspaceId,
          });
        const credentials = {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken ?? null,
          handle: args.handle,
          scopes: tokenResponse.scopes ?? provider.oauthConfig.scopes,
          lastCredentialsRefreshedAt: new Date(),
          authFailedAt: null,
          authFailedReason: null,
          visibility,
          userWorkspaceId,
        };

        if (isDefined(reconnectTarget)) {
          await repository.update(
            { id: reconnectTarget.id, workspaceId },
            credentials,
          );

          return {
            connectedAccount: await repository.findOneByOrFail({
              id: reconnectTarget.id,
              workspaceId,
            }),
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

        return { connectedAccount };
      },
    );
  }
}
