import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

import { computeEncryptionKeyId } from './utils/compute-encryption-key-id.util';
import { decryptAesCtrOrThrow } from './utils/decrypt-aes-ctr-or-throw.util';
import { decryptAesGcmV2OrThrow } from './utils/decrypt-aes-gcm-v2-or-throw.util';
import { encryptAesCtr } from './utils/encrypt-aes-ctr.util';
import { encryptAesGcmV2 } from './utils/encrypt-aes-gcm-v2.util';
import { formatSecretEncryptionEnvelopeV2 } from './utils/format-secret-encryption-envelope-v2.util';
import { parseSecretEncryptionEnvelopeOrThrow } from './utils/parse-secret-encryption-envelope-or-throw.util';
import { pickEncryptionKeyByKeyIdOrThrow } from './utils/pick-encryption-key-by-key-id-or-throw.util';
import { resolveEncryptionKeysOrThrow } from './utils/resolve-encryption-keys-or-throw.util';

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

  public encrypt(value: string): string {
    if (!isDefined(value)) {
      return value;
    }

    const { primary } = resolveEncryptionKeysOrThrow({
      environmentConfigDriver: this.environmentConfigDriver,
    });

    return encryptAesCtr({ plaintext: value, rawKey: primary });
  }

  // Legacy CTR has no integrity tag, so a wrong key produces an arbitrary
  // byte sequence rather than throwing. Rotation of these rows requires
  // migrating the consumer to the versioned envelope first.
  public decrypt(value: string): string {
    if (!isDefined(value)) {
      return value;
    }

    const { primary } = resolveEncryptionKeysOrThrow({
      environmentConfigDriver: this.environmentConfigDriver,
    });

    return decryptAesCtrOrThrow({ ciphertext: value, rawKey: primary });
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

    return this.maskDecryptedValue(this.decrypt(value), mask);
  }

  public decryptAndMaskVersioned({
    value,
    mask,
    workspaceId,
  }: {
    value: string;
    mask: string;
    workspaceId?: string;
  }): string {
    if (!isDefined(value)) {
      return value;
    }

    return this.maskDecryptedValue(
      this.decryptVersioned(value, { workspaceId }),
      mask,
    );
  }

  private maskDecryptedValue(decryptedValue: string, mask: string): string {
    // Visible-char count caps at 5 and at one-tenth of the secret length, so
    // short secrets reveal nothing and longer secrets reveal a stable prefix.
    const visibleCharsCount = Math.min(
      5,
      Math.floor(decryptedValue.length / 10),
    );

    return `${decryptedValue.slice(0, visibleCharsCount)}${mask}`;
  }

  public encryptVersioned(value: string, opts: VersionedOptions = {}): string {
    if (!isDefined(value)) {
      return value;
    }

    const { primary } = resolveEncryptionKeysOrThrow({
      environmentConfigDriver: this.environmentConfigDriver,
    });
    const payloadBase64 = encryptAesGcmV2({
      plaintext: value,
      rawKey: primary,
      workspaceId: opts.workspaceId,
    });
    const keyId = computeEncryptionKeyId({ rawKey: primary });

    return formatSecretEncryptionEnvelopeV2({ keyId, payloadBase64 });
  }

  public decryptVersioned(value: string, opts: VersionedOptions = {}): string {
    if (!isDefined(value)) {
      return value;
    }

    const parsed = parseSecretEncryptionEnvelopeOrThrow({ value });

    if (parsed.version === 2) {
      const keys = resolveEncryptionKeysOrThrow({
        environmentConfigDriver: this.environmentConfigDriver,
      });
      const rawKey = pickEncryptionKeyByKeyIdOrThrow({
        keyId: parsed.keyId,
        keys,
      });

      return decryptAesGcmV2OrThrow({
        payloadBase64: parsed.payload,
        rawKey,
        workspaceId: opts.workspaceId,
      });
    }

    this.warnLegacyDecryptionOnce();

    return this.decrypt(value);
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
