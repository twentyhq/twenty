import { Injectable } from '@nestjs/common';

import { parseJson } from 'twenty-shared/utils';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { isEncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/is-encrypted-string.util';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type UnsubscribeTokenPayload } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-token-payload.type';
import { type UnsubscribeTokenVerification } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-token-verification.type';
import { isUnsubscribeTokenExpired } from 'src/engine/core-modules/emailing-domain/utils/is-unsubscribe-token-expired.util';
import { unsubscribeTokenPayloadSchema } from 'src/engine/core-modules/emailing-domain/zod-schemas/unsubscribe-token-payload.zod-schema';

const WORKSPACE_ID_SEPARATOR = '.';

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

    const envelope = this.secretEncryptionService.encryptVersioned(
      JSON.stringify(stampedPayload) as PlaintextString,
      { workspaceId: payload.workspaceId },
    );

    return Buffer.from(
      `${payload.workspaceId}${WORKSPACE_ID_SEPARATOR}${envelope}`,
    ).toString('base64url');
  }

  verify(token: string): UnsubscribeTokenVerification | null {
    const decodedToken = Buffer.from(token, 'base64url').toString('utf8');
    const separatorIndex = decodedToken.indexOf(WORKSPACE_ID_SEPARATOR);

    if (separatorIndex === -1) {
      return null;
    }

    const workspaceId = decodedToken.slice(0, separatorIndex);
    const envelope = decodedToken.slice(separatorIndex + 1);

    if (!isEncryptedString(envelope)) {
      return null;
    }

    const payload = this.decryptPayload({ envelope, workspaceId });

    if (payload === null) {
      return null;
    }

    return {
      payload,
      isExpired: isUnsubscribeTokenExpired({
        issuedAt: payload.issuedAt,
        now: Date.now(),
      }),
    };
  }

  private decryptPayload({
    envelope,
    workspaceId,
  }: {
    envelope: EncryptedString;
    workspaceId: string;
  }): UnsubscribeTokenPayload | null {
    try {
      const decrypted = this.secretEncryptionService.decryptVersionedOrThrow(
        envelope,
        { workspaceId },
      );

      const parsedPayload = unsubscribeTokenPayloadSchema.safeParse(
        parseJson<unknown>(decrypted),
      );

      if (!parsedPayload.success) {
        return null;
      }

      if (parsedPayload.data.workspaceId !== workspaceId) {
        return null;
      }

      return parsedPayload.data;
    } catch {
      return null;
    }
  }
}
