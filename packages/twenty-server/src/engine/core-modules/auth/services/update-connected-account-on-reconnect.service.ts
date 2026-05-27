import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { coercePlaintextFromOAuthProviderResponse } from 'src/engine/core-modules/secret-encryption/branded-strings/coerce-plaintext-from-oauth-provider-response.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export type UpdateConnectedAccountOnReconnectInput = {
  workspaceId: string;
  connectedAccountId: string;
  accessToken: string;
  refreshToken: string;
  scopes: string[];
  transactionManager: EntityManager;
};

@Injectable()
export class UpdateConnectedAccountOnReconnectService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
  ) {}

  async updateConnectedAccountOnReconnect(
    input: UpdateConnectedAccountOnReconnectInput,
  ): Promise<void> {
    const {
      workspaceId,
      connectedAccountId,
      accessToken,
      refreshToken,
      scopes,
    } = input;

    // Boundary: tokens entering here were just re-issued by the external
    // OAuth provider on reconnect, so we brand them as plaintext before
    // handing them to the encryption service.
    const { encryptedAccessToken, encryptedRefreshToken } =
      this.connectedAccountTokenEncryptionService.encryptTokenPair({
        accessToken: coercePlaintextFromOAuthProviderResponse(accessToken),
        refreshToken: coercePlaintextFromOAuthProviderResponse(refreshToken),
        workspaceId,
      });

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await input.transactionManager
        .getRepository(ConnectedAccountEntity)
        .update(
          {
            id: connectedAccountId,
            workspaceId,
          },
          {
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            scopes,
            authFailedAt: null,
          },
        );
    }, authContext);
  }
}
