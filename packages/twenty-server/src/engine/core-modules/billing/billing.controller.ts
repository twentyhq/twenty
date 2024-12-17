import {
  Controller,
  Headers,
  Logger,
  Post,
  RawBodyRequest,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';

import { Response } from 'express';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { WebhookEvent } from 'src/engine/core-modules/billing/enums/billing-webhook-events.enum';
import { BillingRestApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-api-exception.filter';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingWebhookEntitlementService } from 'src/engine/core-modules/billing/services/billing-webhook-entitlement.service';
import { BillingWebhookProductService } from 'src/engine/core-modules/billing/services/billing-webhook-product.service';
import { BillingWebhookSubscriptionService } from 'src/engine/core-modules/billing/services/billing-webhook-subscription.service';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
@Controller('billing')
@UseFilters(BillingRestApiExceptionFilter)
export class BillingController {
  protected readonly logger = new Logger(BillingController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly billingWebhookSubscriptionService: BillingWebhookSubscriptionService,
    private readonly billingWebhookEntitlementService: BillingWebhookEntitlementService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingWebhookProductService: BillingWebhookProductService,
  ) {}

  @Post('/webhooks')
  async handleWebhooks(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    if (!req.rawBody) {
      res.status(400).end();

      return;
    }
    const event = this.stripeService.constructEventFromPayload(
      signature,
      req.rawBody,
    );

    if (event.type === WebhookEvent.SETUP_INTENT_SUCCEEDED) {
      await this.billingSubscriptionService.handleUnpaidInvoices(event.data);
    }

    if (
      event.type === WebhookEvent.CUSTOMER_SUBSCRIPTION_CREATED ||
      event.type === WebhookEvent.CUSTOMER_SUBSCRIPTION_UPDATED ||
      event.type === WebhookEvent.CUSTOMER_SUBSCRIPTION_DELETED
    ) {
      const workspaceId = event.data.object.metadata?.workspaceId;

      if (!workspaceId) {
        res.status(404).end();

        return;
      }

      await this.billingWebhookSubscriptionService.processStripeEvent(
        workspaceId,
        event.data,
      );
    }
    if (
      event.type === WebhookEvent.CUSTOMER_ACTIVE_ENTITLEMENT_SUMMARY_UPDATED
    ) {
      try {
        await this.billingWebhookEntitlementService.processStripeEvent(
          event.data,
        );
      } catch (error) {
        if (
          error instanceof BillingException &&
          error.code === BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND
        ) {
          res.status(404).end();
        }
      }
    }

    if (
      event.type === WebhookEvent.PRODUCT_CREATED ||
      event.type === WebhookEvent.PRODUCT_UPDATED
    ) {
      await this.billingWebhookProductService.processStripeEvent(event.data);
    }

    res.status(200).end();
  }
}
