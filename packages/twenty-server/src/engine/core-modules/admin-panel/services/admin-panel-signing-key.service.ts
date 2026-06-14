import { Injectable } from '@nestjs/common';

import { SigningKeyDTO } from 'src/engine/core-modules/admin-panel/dtos/signing-key.dto';
import { SigningKeysAdminPanelDTO } from 'src/engine/core-modules/admin-panel/dtos/signing-keys-admin-panel.dto';
import { type SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { SigningKeyVerifyCounterService } from 'src/engine/core-modules/jwt/services/signing-key-verify-counter.service';

@Injectable()
export class AdminPanelSigningKeyService {
  constructor(
    private readonly jwtKeyManagerService: JwtKeyManagerService,
    private readonly signingKeyVerifyCounterService: SigningKeyVerifyCounterService,
  ) {}

  async getSigningKeys(): Promise<SigningKeysAdminPanelDTO> {
    const signingKeys = await this.jwtKeyManagerService.listSigningKeys();
    const usage = await this.signingKeyVerifyCounterService.getUsageInWindow(
      signingKeys.map((signingKey) => signingKey.id),
    );

    return {
      signingKeys: signingKeys.map((signingKey) =>
        this.toSigningKeyDTO(signingKey, usage.byKid[signingKey.id] ?? 0),
      ),
      legacyVerifyCountInWindow: usage.legacyCount,
      verifyWindowDays: usage.windowDays,
    };
  }

  async revokeSigningKey(id: string): Promise<SigningKeyDTO> {
    const revoked = await this.jwtKeyManagerService.revokeSigningKey(id);
    const usage = await this.signingKeyVerifyCounterService.getUsageInWindow([
      revoked.id,
    ]);

    return this.toSigningKeyDTO(revoked, usage.byKid[revoked.id] ?? 0);
  }

  private toSigningKeyDTO(
    signingKey: SigningKeyEntity,
    verifyCountInWindow: number,
  ): SigningKeyDTO {
    return {
      id: signingKey.id,
      publicKey: signingKey.publicKey,
      isCurrent: signingKey.isCurrent,
      createdAt: signingKey.createdAt,
      revokedAt: signingKey.revokedAt,
      verifyCountInWindow,
    };
  }
}
