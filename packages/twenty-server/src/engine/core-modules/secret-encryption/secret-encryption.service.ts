import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

import { decryptAesCtrV1, encryptAesCtrV1 } from './utils/aes-ctr-v1.util';
import { decryptAesGcmV2, encryptAesGcmV2 } from './utils/aes-gcm-v2.util';
import { formatV2Envelope, parseEnvelope } from './utils/envelope.util';
import { computeKeyId } from './utils/key-id.util';
import {
  resolveEncryptionKeys,
  type ResolvedEncryptionKeys,
} from './utils/key-resolution.util';

type VersionedOptions = {
  workspaceId?: string;
};

@Injectable()
export class SecretEncryptionService {
  private readonly logger = new Logger(SecretEncryptionService.name);
  private hasLoggedLegacyDecryption = false;

  constructor(
    private readonly environmentConfigDriver: EnvironmentConfigDriver,
  ) {}

  private resolveKeys(): ResolvedEncryptionKeys {
    return resolveEncryptionKeys(this.environmentConfigDriver);
  }

  // Legacy API — unchanged wire format (unprefixed CTR). Kept for the many
  // consumers that have not yet migrated to the versioned envelope.
  public encrypt(value: string): string {
    if (!isDefined(value)) {
      return value;
    }

    const { primary } = this.resolveKeys();

    return encryptAesCtrV1(value, primary);
  }

  public decrypt(value: string): string {
    if (!isDefined(value)) {
      return value;
    }

    // Legacy CTR has no integrity tag, so we cannot detect a wrong key and
    // try the fallback — it would silently return garbage. Use primary only.
    // To rotate CTR-encrypted data, migrate the consumer to the versioned
    // envelope first (where keyId + auth tag make rotation safe).
    const { primary } = this.resolveKeys();

    return decryptAesCtrV1(value, primary);
  }

  public decryptAndMask({
    value,
    mask,
  }: {
    value: string;
    mask: string;
  }): string {
    if (!isDefined(value)) {
      return value;
    }

    const decryptedValue = this.decrypt(value);
    const visibleCharsCount = Math.min(
      5,
      Math.floor(decryptedValue.length / 10),
    );

    return `${decryptedValue.slice(0, visibleCharsCount)}${mask}`;
  }

  // Versioned-envelope API — produces enc:v2:<keyId>:<base64> using AES-GCM
  // with an HKDF-derived per-context key. Decrypt handles v2, v1, and the
  // legacy unprefixed format transparently.
  public encryptVersioned(value: string, opts: VersionedOptions = {}): string {
    if (!isDefined(value)) {
      return value;
    }

    const { primary } = this.resolveKeys();
    const payload = encryptAesGcmV2(value, primary, opts.workspaceId);
    const keyId = computeKeyId(primary);

    return formatV2Envelope(keyId, payload);
  }

  public decryptVersioned(value: string, opts: VersionedOptions = {}): string {
    if (!isDefined(value)) {
      return value;
    }

    const parsed = parseEnvelope(value);

    if (parsed.version === 2) {
      return this.decryptV2(parsed.keyId, parsed.payload, opts.workspaceId);
    }

    if (parsed.version === 1) {
      // v1 = legacy CTR (no integrity tag, no keyId). We cannot detect a
      // wrong key, so we trust the primary. Rotation of v1 rows requires
      // running the re-encrypt slow command first to convert them to v2.
      const { primary } = this.resolveKeys();

      return decryptAesCtrV1(parsed.payload, primary);
    }

    this.warnLegacyDecryptionOnce();

    return this.decrypt(value);
  }

  private decryptV2(
    keyId: string,
    payload: string,
    workspaceId: string | undefined,
  ): string {
    const { primary, fallback } = this.resolveKeys();

    if (computeKeyId(primary) === keyId) {
      return decryptAesGcmV2(payload, primary, workspaceId);
    }

    if (fallback !== null && computeKeyId(fallback) === keyId) {
      return decryptAesGcmV2(payload, fallback, workspaceId);
    }

    throw new Error(
      `No encryption key matches keyId '${keyId}'. Configure FALLBACK_ENCRYPTION_KEY with the key that encrypted this row.`,
    );
  }

  private warnLegacyDecryptionOnce(): void {
    if (this.hasLoggedLegacyDecryption) {
      return;
    }

    this.hasLoggedLegacyDecryption = true;
    this.logger.warn(
      'Decrypted a legacy unprefixed ciphertext. These rows should be re-encrypted into the enc:v2 envelope in a follow-up migration.',
    );
  }
}
