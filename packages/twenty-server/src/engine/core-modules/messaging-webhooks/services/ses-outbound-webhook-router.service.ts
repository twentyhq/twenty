import { BadRequestException, Injectable } from '@nestjs/common';

import type SnsPayloadValidator from 'sns-payload-validator';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { SesOutboundSendingStateHandlerService } from 'src/engine/core-modules/messaging-webhooks/services/ses-outbound-sending-state-handler.service';
import { SnsSignatureVerifierService } from 'src/engine/core-modules/messaging-webhooks/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/engine/core-modules/messaging-webhooks/services/sns-subscription-confirmer.service';
import { type SesEventBridgeNotification } from 'src/engine/core-modules/messaging-webhooks/types/ses-event-bridge-notification.type';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class SesOutboundWebhookRouterService {
  constructor(
    private readonly snsSignatureVerifierService: SnsSignatureVerifierService,
    private readonly snsSubscriptionConfirmerService: SnsSubscriptionConfirmerService,
    private readonly sesOutboundSendingStateHandlerService: SesOutboundSendingStateHandlerService,
  ) {}

  async route(rawBody: Buffer): Promise<void> {
    const payload = parseJson<SnsPayload>(rawBody.toString('utf8'));

    if (!isDefined(payload)) {
      throw new BadRequestException('Invalid SNS payload');
    }

    await this.snsSignatureVerifierService.assertAllowedAndSigned(payload);

    if (
      payload.Type === 'SubscriptionConfirmation' ||
      payload.Type === 'UnsubscribeConfirmation'
    ) {
      await this.snsSubscriptionConfirmerService.confirm(payload.SubscribeURL);

      return;
    }

    if (payload.Type !== 'Notification') {
      return;
    }

    const event = parseJson<SesEventBridgeNotification>(payload.Message);

    if (!isDefined(event)) {
      return;
    }

    await this.sesOutboundSendingStateHandlerService.handle(event);
  }
}
