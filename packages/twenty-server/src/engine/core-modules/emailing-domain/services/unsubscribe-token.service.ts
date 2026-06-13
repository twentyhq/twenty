import { Injectable } from '@nestjs/common';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type UnsubscribeTokenPayload } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-token-payload.type';

// Tokens travel in mail headers and public links, so the payload is encrypted
// (AES-256-GCM), not just signed: the recipient address and workspace id stay
// opaque to anyone holding the link.
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
      const decrypted = this.secretEncryptionService.decryptVersioned(
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
        // Default to 0 for any token minted before issuedAt existed, so it still
        // verifies (and reads as epoch-old) rather than being rejected.
        issuedAt: typeof decoded?.issuedAt === 'number' ? decoded.issuedAt : 0,
        ...(typeof decoded?.messageTopicId === 'string'
          ? { messageTopicId: decoded.messageTopicId }
          : {}),
        ...(decoded?.preview === true ? { preview: true } : {}),
      };
    } catch {
      return null;
    }
  }
}
