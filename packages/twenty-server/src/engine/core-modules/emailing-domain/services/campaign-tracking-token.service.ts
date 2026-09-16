import { Injectable } from '@nestjs/common';

import { createHmac, timingSafeEqual } from 'node:crypto';

import { isDefined } from 'twenty-shared/utils';

import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { computeEncryptionKeyId } from 'src/engine/core-modules/secret-encryption/utils/compute-encryption-key-id.util';
import { deriveInstanceHmacKey } from 'src/engine/core-modules/secret-encryption/utils/derive-instance-hmac-key.util';
import { resolveEncryptionKeysOrThrow } from 'src/engine/core-modules/secret-encryption/utils/resolve-encryption-keys-or-throw.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type SigningKey = { keyId: Buffer; key: Buffer };

const CAMPAIGN_TRACKING_TOKEN_VERSION = 1;

const CAMPAIGN_TRACKING_TOKEN_HMAC_PURPOSE = 'campaign-tracking';

const CAMPAIGN_TRACKING_TOKEN_PURPOSE_BYTE = {
  CLICK: 1,
} as const;

const VERSION_BYTE_LENGTH = 1;
const KEY_ID_BYTE_LENGTH = 4;
const PURPOSE_BYTE_LENGTH = 1;
const UUID_BYTE_LENGTH = 16;
const SIGNATURE_BYTE_LENGTH = 16;

const CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH = {
  keyId: KEY_ID_BYTE_LENGTH,
  uuid: UUID_BYTE_LENGTH,
  signature: SIGNATURE_BYTE_LENGTH,
  clickPayload:
    VERSION_BYTE_LENGTH +
    KEY_ID_BYTE_LENGTH +
    PURPOSE_BYTE_LENGTH +
    UUID_BYTE_LENGTH +
    UUID_BYTE_LENGTH,
} as const;

@Injectable()
export class CampaignTrackingTokenService {
  private signingKeys: SigningKey[] | undefined;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  sign(payload: CampaignTrackingTokenPayload): string {
    const [primaryKey] = this.resolveSigningKeys();
    const encodedPayload = this.encodePayload(payload, primaryKey.keyId);

    return Buffer.concat([
      encodedPayload,
      this.computeSignature(encodedPayload, primaryKey.key),
    ]).toString('base64url');
  }

  verify(token: string): CampaignTrackingTokenPayload | null {
    const decodedToken = Buffer.from(token, 'base64url');

    if (decodedToken.toString('base64url') !== token) {
      return null;
    }

    const payloadByteLength =
      decodedToken.length - CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.signature;

    if (
      payloadByteLength !== CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.clickPayload
    ) {
      return null;
    }

    const encodedPayload = decodedToken.subarray(0, payloadByteLength);
    const signature = decodedToken.subarray(payloadByteLength);

    if (encodedPayload.readUInt8(0) !== CAMPAIGN_TRACKING_TOKEN_VERSION) {
      return null;
    }

    const keyId = encodedPayload.subarray(
      1,
      1 + CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.keyId,
    );
    const signingKey = this.resolveSigningKeys().find((candidate) =>
      candidate.keyId.equals(keyId),
    );

    if (!isDefined(signingKey)) {
      return null;
    }

    if (
      !timingSafeEqual(
        signature,
        this.computeSignature(encodedPayload, signingKey.key),
      )
    ) {
      return null;
    }

    return this.decodePayload(encodedPayload);
  }

  private encodePayload(
    payload: CampaignTrackingTokenPayload,
    keyId: Buffer,
  ): Buffer {
    const header = Buffer.from([
      CAMPAIGN_TRACKING_TOKEN_VERSION,
      ...keyId,
      CAMPAIGN_TRACKING_TOKEN_PURPOSE_BYTE[payload.purpose],
    ]);
    const identifiers = Buffer.concat([
      this.encodeUuid(payload.deliveryId),
      this.encodeUuid(payload.shortLinkId),
    ]);

    return Buffer.concat([header, identifiers]);
  }

  private decodePayload(
    encodedPayload: Buffer,
  ): CampaignTrackingTokenPayload | null {
    const purposeOffset = 1 + CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.keyId;
    const purposeByte = encodedPayload.readUInt8(purposeOffset);

    if (purposeByte !== CAMPAIGN_TRACKING_TOKEN_PURPOSE_BYTE.CLICK) {
      return null;
    }

    const deliveryIdOffset = purposeOffset + 1;
    const shortLinkIdOffset =
      deliveryIdOffset + CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.uuid;

    return {
      purpose: 'CLICK',
      deliveryId: this.decodeUuid(
        encodedPayload.subarray(
          deliveryIdOffset,
          deliveryIdOffset + CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.uuid,
        ),
      ),
      shortLinkId: this.decodeUuid(
        encodedPayload.subarray(
          shortLinkIdOffset,
          shortLinkIdOffset + CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.uuid,
        ),
      ),
    };
  }

  private computeSignature(encodedPayload: Buffer, key: Buffer): Buffer {
    return createHmac('sha256', key)
      .update(encodedPayload)
      .digest()
      .subarray(0, CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.signature);
  }

  private resolveSigningKeys(): SigningKey[] {
    if (isDefined(this.signingKeys)) {
      return this.signingKeys;
    }

    const { primary, fallback } = resolveEncryptionKeysOrThrow({
      environmentConfigDriver: this.twentyConfigService,
    });

    this.signingKeys = [
      primary,
      ...(isDefined(fallback) ? [fallback] : []),
    ].map((rawKey) => ({
      keyId: Buffer.from(computeEncryptionKeyId({ rawKey }), 'hex'),
      key: deriveInstanceHmacKey({
        rawKey,
        purpose: CAMPAIGN_TRACKING_TOKEN_HMAC_PURPOSE,
      }),
    }));

    return this.signingKeys;
  }

  private encodeUuid(uuid: string): Buffer {
    return Buffer.from(uuid.replace(/-/g, ''), 'hex');
  }

  private decodeUuid(buffer: Buffer): string {
    const hex = buffer.toString('hex');

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join('-');
  }
}
