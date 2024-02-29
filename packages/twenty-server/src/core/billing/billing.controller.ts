import {
  Controller,
  Headers,
  Req,
  RawBodyRequest,
  Logger,
  Post,
  Res,
} from '@nestjs/common';

import { Response } from 'express';

import { BillingService, WebhookEvent } from 'src/core/billing/billing.service';
import { StripeService } from 'src/core/billing/stripe/stripe.service';

@Controller('billing')
export class BillingController {
  protected readonly logger = new Logger(BillingController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly billingService: BillingService,
  ) {}

  @Post('/webhooks')
  async handleWebhooks(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    if (!req.rawBody) {
      res.status(400).send('Missing raw body');

      return;
    }
    const event = this.stripeService.constructEventFromPayload(
      signature,
      req.rawBody,
    );

    if (event.type === WebhookEvent.CUSTOMER_SUBSCRIPTION_UPDATED) {
      if (event.data.object.status !== 'active') {
        res.status(402).send('Payment did not succeeded');

        return;
      }

      const workspaceId = event.data.object.metadata?.workspaceId;

      if (!workspaceId) {
        res.status(404).send('Missing workspaceId in webhook event metadata');

        return;
      }

      await this.billingService.createBillingSubscription(
        workspaceId,
        event.data,
      );

      res.status(200).send('Subscription successfully updated');
    }
  }
}
