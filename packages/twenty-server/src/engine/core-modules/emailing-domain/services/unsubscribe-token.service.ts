import { Injectable } from '@nestjs/common';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type UnsubscribeTokenPayload } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-token-payload.type';

@Injectable()
export class UnsubscribeTokenService {
  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  sign(payload: Omit<UnsubscribeTokenPayload, 'issuedAt'>): string {
    const stampedPayload: UnsubscribeTokenPayload = {
      ...payload,
      issuedAt: Date.now(),
    };

    return Buffer.from(
      this.secretEncryptionService.encryptVersioned(
        JSON.stringify(stampedPayload) as PlaintextString,
      ),
    ).toString('base64url');
  }

  verify(token: string): UnsubscribeTokenPayload | null {
    try {
      const decrypted = this.secretEncryptionService.decryptVersionedOrThrow(
        Buffer.from(token, 'base64url').toString('utf8') as EncryptedString,
      );

      const decoded = JSON.parse(decrypted);

      if (
        typeof decoded?.workspaceId !== 'string' ||
        typeof decoded?.emailAddress !== 'string'
      ) {
        return null;
      }

      return {
        workspaceId: decoded.workspaceId,
        emailAddress: decoded.emailAddress,
        issuedAt: typeof decoded?.issuedAt === 'number' ? decoded.issuedAt : 0,
        ...(typeof decoded?.unsubscribeTopicId === 'string'
          ? { unsubscribeTopicId: decoded.unsubscribeTopicId }
          : {}),
        ...(decoded?.preview === true ? { preview: true } : {}),
      };
    } catch {
      return null;
    }
  }
}
