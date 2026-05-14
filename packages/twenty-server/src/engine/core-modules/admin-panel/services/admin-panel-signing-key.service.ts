import { Injectable } from '@nestjs/common';

import { SigningKeyDTO } from 'src/engine/core-modules/admin-panel/dtos/signing-key.dto';
import { SigningKeysAdminPanelDTO } from 'src/engine/core-modules/admin-panel/dtos/signing-keys-admin-panel.dto';
import {
  LEGACY_SIGNING_KEY_USAGE_IDENTIFIER,
  SIGNING_KEY_USAGE_WINDOW_DAYS,
} from 'src/engine/core-modules/jwt/constants/signing-key-usage.constant';
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
    const identifiers = [
      ...signingKeys.map((signingKey) => signingKey.id),
      LEGACY_SIGNING_KEY_USAGE_IDENTIFIER,
    ];

    const verifyCounts =
      await this.signingKeyVerifyCounterService.getCountsInWindow(identifiers);

    return {
      signingKeys: signingKeys.map((signingKey) =>
        this.toSigningKeyDTO(signingKey, verifyCounts[signingKey.id] ?? 0),
      ),
      legacyVerifyCountInWindow:
        verifyCounts[LEGACY_SIGNING_KEY_USAGE_IDENTIFIER] ?? 0,
      verifyWindowDays: SIGNING_KEY_USAGE_WINDOW_DAYS,
    };
  }

  async revokeSigningKey(id: string): Promise<SigningKeyDTO> {
    const revoked = await this.jwtKeyManagerService.revokeSigningKey(id);
    const verifyCount =
      await this.signingKeyVerifyCounterService.getCountInWindow(revoked.id);

    return this.toSigningKeyDTO(revoked, verifyCount);
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
