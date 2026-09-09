import { Injectable } from '@nestjs/common';

import { createHmac, timingSafeEqual } from 'node:crypto';

import { isDefined } from 'twenty-shared/utils';

import { CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-byte-length.constant';
import { CAMPAIGN_TRACKING_TOKEN_HMAC_PURPOSE } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-hmac-purpose.constant';
import { CAMPAIGN_TRACKING_TOKEN_MESSAGE_PART_BYTE } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-message-part-byte.constant';
import { CAMPAIGN_TRACKING_TOKEN_PURPOSE_BYTE } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-purpose-byte.constant';
import { CAMPAIGN_TRACKING_TOKEN_VERSION } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-version.constant';
import { type CampaignMessagePart } from 'src/engine/core-modules/emailing-domain/types/campaign-message-part.type';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { computeEncryptionKeyId } from 'src/engine/core-modules/secret-encryption/utils/compute-encryption-key-id.util';
import { deriveInstanceHmacKey } from 'src/engine/core-modules/secret-encryption/utils/derive-instance-hmac-key.util';
import { resolveEncryptionKeysOrThrow } from 'src/engine/core-modules/secret-encryption/utils/resolve-encryption-keys-or-throw.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type SigningKey = { keyId: Buffer; key: Buffer };

const PAYLOAD_BYTE_LENGTHS: number[] = [
  CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.clickPayload,
  CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.openPayload,
];

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

    if (!PAYLOAD_BYTE_LENGTHS.includes(payloadByteLength)) {
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
    const identifiers =
      payload.purpose === 'CLICK'
        ? Buffer.concat([
            this.encodeUuid(payload.deliveryId),
            this.encodeUuid(payload.destinationId),
          ])
        : this.encodeUuid(payload.deliveryId);
    const messagePart = Buffer.from([
      CAMPAIGN_TRACKING_TOKEN_MESSAGE_PART_BYTE[payload.messagePart],
    ]);

    return Buffer.concat([header, identifiers, messagePart]);
  }

  private decodePayload(
    encodedPayload: Buffer,
  ): CampaignTrackingTokenPayload | null {
    const purposeOffset = 1 + CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.keyId;
    const purposeByte = encodedPayload.readUInt8(purposeOffset);
    const deliveryIdOffset = purposeOffset + 1;
    const destinationIdOffset =
      deliveryIdOffset + CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.uuid;
    const deliveryId = this.decodeUuid(
      encodedPayload.subarray(deliveryIdOffset, destinationIdOffset),
    );
    const messagePart = this.decodeMessagePart(
      encodedPayload.readUInt8(encodedPayload.length - 1),
    );

    if (!isDefined(messagePart)) {
      return null;
    }

    if (
      purposeByte === CAMPAIGN_TRACKING_TOKEN_PURPOSE_BYTE.CLICK &&
      encodedPayload.length === CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.clickPayload
    ) {
      return {
        purpose: 'CLICK',
        deliveryId,
        destinationId: this.decodeUuid(
          encodedPayload.subarray(
            destinationIdOffset,
            destinationIdOffset + CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.uuid,
          ),
        ),
        messagePart,
      };
    }

    if (
      purposeByte === CAMPAIGN_TRACKING_TOKEN_PURPOSE_BYTE.OPEN &&
      encodedPayload.length ===
        CAMPAIGN_TRACKING_TOKEN_BYTE_LENGTH.openPayload &&
      messagePart === 'HTML'
    ) {
      return { purpose: 'OPEN', deliveryId, messagePart };
    }

    return null;
  }

  private decodeMessagePart(byte: number): CampaignMessagePart | undefined {
    switch (byte) {
      case CAMPAIGN_TRACKING_TOKEN_MESSAGE_PART_BYTE.HTML:
        return 'HTML';
      case CAMPAIGN_TRACKING_TOKEN_MESSAGE_PART_BYTE.TEXT:
        return 'TEXT';
      default:
        return undefined;
    }
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
