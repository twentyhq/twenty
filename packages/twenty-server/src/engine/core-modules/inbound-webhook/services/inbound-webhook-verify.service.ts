import { Injectable } from '@nestjs/common';

import { InboundWebhookException, InboundWebhookExceptionCode } from 'src/engine/core-modules/inbound-webhook/inbound-webhook.exception';
import { INBOUND_WEBHOOK_REPLAY_WINDOW_MS } from 'src/engine/core-modules/inbound-webhook/inbound-webhook.constants';
import {
  type HmacAlgorithm,
  verifyHmacSignature,
} from 'src/engine/core-modules/inbound-webhook/utils/hmac-signature.util';

@Injectable()
export class InboundWebhookVerifyService {
  verifyHmac({
    algorithm,
    secret,
    payload,
    expectedSignature,
  }: {
    algorithm: HmacAlgorithm;
    secret: string;
    payload: string | Buffer;
    expectedSignature: string;
  }): boolean {
    return verifyHmacSignature({
      algorithm,
      secret,
      payload,
      expectedSignature,
    });
  }

  assertWithinReplayWindow(timestampMs: number): void {
    const drift = Math.abs(Date.now() - timestampMs);

    if (drift > INBOUND_WEBHOOK_REPLAY_WINDOW_MS) {
      throw new InboundWebhookException(
        `Inbound webhook timestamp drift ${drift}ms exceeds replay window`,
        InboundWebhookExceptionCode.REPLAY_WINDOW_EXCEEDED,
      );
    }
  }
}
