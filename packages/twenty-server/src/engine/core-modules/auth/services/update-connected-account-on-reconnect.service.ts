import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export type UpdateConnectedAccountOnReconnectInput = {
  workspaceId: string;
  connectedAccountId: string;
  accessToken: PlaintextString;
  refreshToken: PlaintextString;
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
        accessToken,
        refreshToken,
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
