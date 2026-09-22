import { Injectable } from '@nestjs/common';

import { createHmac, timingSafeEqual } from 'node:crypto';

import { isDefined } from 'twenty-shared/utils';

import { CAMPAIGN_TRACKING_TOKEN_LAYOUT } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-layout.constant';
import { CAMPAIGN_TRACKING_TOKEN_VERSION } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-version.constant';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { computeEncryptionKeyId } from 'src/engine/core-modules/secret-encryption/utils/compute-encryption-key-id.util';
import { deriveInstanceHmacKey } from 'src/engine/core-modules/secret-encryption/utils/derive-instance-hmac-key.util';
import { resolveEncryptionKeysOrThrow } from 'src/engine/core-modules/secret-encryption/utils/resolve-encryption-keys-or-throw.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type SigningKey = { keyId: Buffer; key: Buffer };
const CLICK_PURPOSE_BYTE = 1;

@Injectable()
export class CampaignTrackingTokenService {
  private signingKeys: SigningKey[] | undefined;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  sign(payload: CampaignTrackingTokenPayload): string {
    const [primaryKey] = this.resolveSigningKeys();
    const encodedPayload = this.encodePayload({
      payload,
      keyId: primaryKey.keyId,
    });

    return Buffer.concat([
      encodedPayload,
      this.computeSignature({ encodedPayload, key: primaryKey.key }),
    ]).toString('base64url');
  }

  verify(token: string): CampaignTrackingTokenPayload | null {
    const decodedToken = Buffer.from(token, 'base64url');

    if (decodedToken.toString('base64url') !== token) {
      return null;
    }

    if (decodedToken.length !== CAMPAIGN_TRACKING_TOKEN_LAYOUT.length) {
      return null;
    }

    const encodedPayload = decodedToken.subarray(
      0,
      CAMPAIGN_TRACKING_TOKEN_LAYOUT.signature,
    );
    const signature = decodedToken.subarray(
      CAMPAIGN_TRACKING_TOKEN_LAYOUT.signature,
    );

    if (
      encodedPayload.readUInt8(CAMPAIGN_TRACKING_TOKEN_LAYOUT.version) !==
      CAMPAIGN_TRACKING_TOKEN_VERSION
    ) {
      return null;
    }

    const keyId = encodedPayload.subarray(
      CAMPAIGN_TRACKING_TOKEN_LAYOUT.keyId,
      CAMPAIGN_TRACKING_TOKEN_LAYOUT.purpose,
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
        this.computeSignature({ encodedPayload, key: signingKey.key }),
      )
    ) {
      return null;
    }

    return this.decodePayload(encodedPayload);
  }

  private encodePayload({
    payload,
    keyId,
  }: {
    payload: CampaignTrackingTokenPayload;
    keyId: Buffer;
  }): Buffer {
    const header = Buffer.from([
      CAMPAIGN_TRACKING_TOKEN_VERSION,
      ...keyId,
      CLICK_PURPOSE_BYTE,
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
    const purposeByte = encodedPayload.readUInt8(
      CAMPAIGN_TRACKING_TOKEN_LAYOUT.purpose,
    );

    if (purposeByte !== CLICK_PURPOSE_BYTE) {
      return null;
    }

    return {
      purpose: 'CLICK',
      deliveryId: this.decodeUuid(
        encodedPayload.subarray(
          CAMPAIGN_TRACKING_TOKEN_LAYOUT.deliveryId,
          CAMPAIGN_TRACKING_TOKEN_LAYOUT.shortLinkId,
        ),
      ),
      shortLinkId: this.decodeUuid(
        encodedPayload.subarray(
          CAMPAIGN_TRACKING_TOKEN_LAYOUT.shortLinkId,
          CAMPAIGN_TRACKING_TOKEN_LAYOUT.signature,
        ),
      ),
    };
  }

  private computeSignature({
    encodedPayload,
    key,
  }: {
    encodedPayload: Buffer;
    key: Buffer;
  }): Buffer {
    return createHmac('sha256', key)
      .update(encodedPayload)
      .digest()
      .subarray(
        0,
        CAMPAIGN_TRACKING_TOKEN_LAYOUT.length -
          CAMPAIGN_TRACKING_TOKEN_LAYOUT.signature,
      );
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
        purpose: 'campaign-tracking',
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
