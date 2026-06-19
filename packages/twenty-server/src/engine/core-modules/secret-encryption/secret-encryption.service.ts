import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
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
  private hasLoggedLegacyCtrDecryption = false;

  constructor(
    private readonly environmentConfigDriver: EnvironmentConfigDriver,
  ) {}

  // Legacy CTR pair (`encrypt` / `decrypt`) is intentionally left unbranded.
  // Its callers predate the enc:v2 envelope and never went through the
  // branded API; retrofitting them is tracked as a separate follow-up.
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
    value: EncryptedString;
    mask: string;
    workspaceId?: string;
  }): string {
    if (!isDefined(value)) {
      return value;
    }

    return this.maskDecryptedValue(
      this.decryptVersionedOrThrow(value, { workspaceId }),
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

  public encryptVersioned(
    value: PlaintextString,
    opts: VersionedOptions = {},
  ): EncryptedString {
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

    return formatSecretEncryptionEnvelopeV2({
      keyId,
      payloadBase64,
    }) as EncryptedString;
  }

  /**
   * @deprecated Tolerates legacy unprefixed AES-CTR ciphertext by falling back
   * to `decrypt`. Kept only for the cross-upgrade batch commands (encryption
   * backfill and key rotation) that may still encounter un-backfilled rows.
   * Runtime services must call `decryptVersionedOrThrow`, which rejects any
   * value that is not an `enc:v2` envelope.
   */
  public decryptVersionedWithLegacyFallback(
    value: EncryptedString,
    opts: VersionedOptions = {},
  ): PlaintextString {
    if (!isDefined(value)) {
      return value;
    }

    const parsed = parseSecretEncryptionEnvelopeOrThrow({ value });

    if (parsed.version !== 2) {
      this.warnLegacyCtrDecryptionOnce();

      return this.decrypt(value) as PlaintextString;
    }

    return this.decryptVersionedOrThrow(value, opts);
  }

  // Strict enc:v2-only read path. Unlike `decryptVersionedWithLegacyFallback`, this throws on any
  // non-versioned ciphertext, ensuring runtime callers fail loudly if the
  // encryption backfill migration has not run rather than silently reading
  // legacy AES-CTR rows.
  public decryptVersionedOrThrow(
    value: EncryptedString,
    opts: VersionedOptions = {},
  ): PlaintextString {
    if (!isDefined(value)) {
      return value;
    }

    const parsed = parseSecretEncryptionEnvelopeOrThrow({ value });

    if (parsed.version !== 2) {
      throw new SecretEncryptionException(
        'Expected an enc:v2 ciphertext envelope but received an unversioned value.',
        SecretEncryptionExceptionCode.MALFORMED_ENVELOPE,
      );
    }

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
    }) as PlaintextString;
  }

  private warnLegacyCtrDecryptionOnce(): void {
    if (this.hasLoggedLegacyCtrDecryption) {
      return;
    }

    this.hasLoggedLegacyCtrDecryption = true;
    this.logger.warn(
      'Decrypted a legacy unprefixed AES-CTR ciphertext. These rows should be re-encrypted into the enc:v2 envelope in a follow-up migration.',
    );
  }
}
