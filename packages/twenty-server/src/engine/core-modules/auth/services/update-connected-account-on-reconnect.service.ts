import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

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

    // Encrypt at the boundary, before the entity ever holds plaintext. From
    // here on the values flow as ciphertext through TypeORM, any logger that
    // touches the update payload, and the database. This is the load-bearing
    // line that fixes the in-flight exposure card 02 originally flagged.
    const encryptedAccessToken =
      this.connectedAccountTokenEncryptionService.encrypt(accessToken);
    const encryptedRefreshToken =
      this.connectedAccountTokenEncryptionService.encrypt(refreshToken);

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
