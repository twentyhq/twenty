import { Injectable } from '@nestjs/common';

import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  CLICK_TRACKING_TOKEN_BYTE_LENGTH,
  CLICK_TRACKING_TOKEN_PAYLOAD_BYTE_LENGTH,
  CLICK_TRACKING_TOKEN_SIGNATURE_BYTE_LENGTH,
  CLICK_TRACKING_TOKEN_SIGNING_CONTEXT,
  CLICK_TRACKING_TOKEN_UUID_BYTE_LENGTH,
} from 'src/engine/core-modules/emailing-domain/constants/click-tracking-token.constant';
import { type ClickTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/click-tracking-token-payload.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ClickTrackingTokenService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  sign({
    messageCampaignLinkId,
    messageId,
  }: ClickTrackingTokenPayload): string {
    const payload = Buffer.concat([
      this.encodeUuid(messageCampaignLinkId),
      this.encodeUuid(messageId),
    ]);

    return Buffer.concat([payload, this.computeSignature(payload)]).toString(
      'base64url',
    );
  }

  verify(token: string): ClickTrackingTokenPayload | null {
    const decodedToken = Buffer.from(token, 'base64url');

    if (decodedToken.length !== CLICK_TRACKING_TOKEN_BYTE_LENGTH) {
      return null;
    }

    const payload = decodedToken.subarray(
      0,
      CLICK_TRACKING_TOKEN_PAYLOAD_BYTE_LENGTH,
    );

    const isAuthentic = timingSafeEqual(
      decodedToken.subarray(CLICK_TRACKING_TOKEN_PAYLOAD_BYTE_LENGTH),
      this.computeSignature(payload),
    );

    if (!isAuthentic) {
      return null;
    }

    return {
      messageCampaignLinkId: this.decodeUuid(
        payload.subarray(0, CLICK_TRACKING_TOKEN_UUID_BYTE_LENGTH),
      ),
      messageId: this.decodeUuid(
        payload.subarray(CLICK_TRACKING_TOKEN_UUID_BYTE_LENGTH),
      ),
    };
  }

  private computeSignature(payload: Buffer): Buffer {
    return createHmac('sha256', this.signingKey)
      .update(payload)
      .digest()
      .subarray(0, CLICK_TRACKING_TOKEN_SIGNATURE_BYTE_LENGTH);
  }

  private get signingKey(): Buffer {
    return createHmac('sha256', this.twentyConfigService.get('APP_SECRET'))
      .update(CLICK_TRACKING_TOKEN_SIGNING_CONTEXT)
      .digest();
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
