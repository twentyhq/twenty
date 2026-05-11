import { BadRequestException, Injectable } from '@nestjs/common';

import type SnsPayloadValidator from 'sns-payload-validator';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { SesInboundMailHandlerService } from 'src/engine/core-modules/messaging-webhooks/services/ses-inbound-mail-handler.service';
import { SnsSignatureVerifierService } from 'src/engine/core-modules/messaging-webhooks/services/sns-signature-verifier.service';
import { SnsSubscriptionConfirmerService } from 'src/engine/core-modules/messaging-webhooks/services/sns-subscription-confirmer.service';
import { type SesInboundNotification } from 'src/engine/core-modules/messaging-webhooks/types/sns-message.type';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Injectable()
export class SesInboundWebhookRouterService {
  constructor(
    private readonly snsSignatureVerifierService: SnsSignatureVerifierService,
    private readonly snsSubscriptionConfirmerService: SnsSubscriptionConfirmerService,
    private readonly sesInboundMailHandlerService: SesInboundMailHandlerService,
  ) {}

  async route(rawBody: Buffer): Promise<void> {
    const payload = parseJson<SnsPayload>(rawBody.toString('utf8'));

    if (!payload) {
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

    const notification = parseJson<SesInboundNotification>(payload.Message);

    if (!isDefined(notification)) {
      return;
    }

    await this.sesInboundMailHandlerService.handle(
      notification,
      payload.MessageId,
    );
  }
}
