import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';

import { type Request } from 'express';
import type SnsPayloadValidator from 'sns-payload-validator';

import { MessagingWebhookDispatcherService } from 'src/engine/core-modules/messaging-webhooks/services/messaging-webhook-dispatcher.service';
import { SnsSignatureVerifierService } from 'src/engine/core-modules/messaging-webhooks/services/sns-signature-verifier.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

type SnsPayload = SnsPayloadValidator.SnsPayload;

@Controller()
export class MessagingWebhooksController {
  constructor(
    private readonly snsSignatureVerifierService: SnsSignatureVerifierService,
    private readonly messagingWebhookDispatcherService: MessagingWebhookDispatcherService,
  ) {}

  @Post(['webhooks/messaging/ses'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleSesWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<void> {
    if (!request.rawBody) {
      throw new BadRequestException('Missing SNS payload');
    }

    const payload = this.parseSnsPayload(request.rawBody);

    await this.snsSignatureVerifierService.assertAllowedAndSigned(payload);

    if (
      payload.Type === 'SubscriptionConfirmation' ||
      payload.Type === 'UnsubscribeConfirmation'
    ) {
      await this.messagingWebhookDispatcherService.confirmSnsSubscription(
        payload.SubscribeURL,
      );

      return;
    }

    if (payload.Type === 'Notification') {
      await this.messagingWebhookDispatcherService.dispatchSnsNotification(
        payload,
      );
    }
  }

  private parseSnsPayload(rawBody: Buffer): SnsPayload {
    try {
      return JSON.parse(rawBody.toString('utf8')) as SnsPayload;
    } catch {
      throw new BadRequestException('Invalid SNS payload');
    }
  }
}
