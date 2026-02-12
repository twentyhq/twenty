/* @license Enterprise */

import {
  Controller,
  Headers,
  Logger,
  Post,
  type RawBodyRequest,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { type Response } from 'express';
import Stripe from 'stripe';

import { BillingWebhookAlertService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-alert.service';
import { BillingWebhookCreditGrantService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-credit-grant.service';
import { BillingWebhookCustomerService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-customer.service';
import { BillingWebhookEntitlementService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-entitlement.service';
import { BillingWebhookInvoiceService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-invoice.service';
import { BillingWebhookPriceService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-price.service';
import { BillingWebhookProductService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-product.service';
import { BillingWebhookSubscriptionScheduleService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-subscription-schedule.service';
import { BillingWebhookSubscriptionService } from 'src/engine/core-modules/billing-webhook/services/billing-webhook-subscription.service';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingWebhookEvent } from 'src/engine/core-modules/billing/enums/billing-webhook-events.enum';
import { BillingRestApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-api-exception.filter';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeWebhookService } from 'src/engine/core-modules/billing/stripe/services/stripe-webhook.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller()
@UseFilters(BillingRestApiExceptionFilter)
export class BillingWebhookController {
  protected readonly logger = new Logger(BillingWebhookController.name);

  constructor(
    private readonly stripeWebhookService: StripeWebhookService,
    private readonly billingWebhookSubscriptionService: BillingWebhookSubscriptionService,
    private readonly billingWebhookEntitlementService: BillingWebhookEntitlementService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingWebhookProductService: BillingWebhookProductService,
    private readonly billingWebhookPriceService: BillingWebhookPriceService,
    private readonly billingWebhookAlertService: BillingWebhookAlertService,
    private readonly billingWebhookInvoiceService: BillingWebhookInvoiceService,
    private readonly billingWebhookCustomerService: BillingWebhookCustomerService,
    private readonly billingWebhookSubscriptionScheduleService: BillingWebhookSubscriptionScheduleService,
    private readonly billingWebhookCreditGrantService: BillingWebhookCreditGrantService,
  ) {}

  @Post(['webhooks/stripe'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async handleWebhooks(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    if (!req.rawBody) {
      throw new BillingException(
        'Missing request body',
        BillingExceptionCode.BILLING_MISSING_REQUEST_BODY,
      );
    }

    try {
      const event = this.stripeWebhookService.constructEventFromPayload(
        signature,
        req.rawBody,
      );
      const result = await this.handleStripeEvent(event);

      res.status(200).send(result).end();
    } catch (error) {
      if (
        error instanceof BillingException ||
        error instanceof Stripe.errors.StripeError
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);

      throw new BillingException(
        errorMessage,
        BillingExceptionCode.BILLING_UNHANDLED_ERROR,
      );
    }
  }

  private async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case BillingWebhookEvent.SETUP_INTENT_SUCCEEDED:
        return await this.billingSubscriptionService.handleUnpaidInvoices(
          event.data,
        );
      case BillingWebhookEvent.PRICE_UPDATED:
      case BillingWebhookEvent.PRICE_CREATED:
        return await this.billingWebhookPriceService.processStripeEvent(
          event.data,
        );

      case BillingWebhookEvent.SUBSCRIPTION_SCHEDULE_UPDATED:
        return await this.billingWebhookSubscriptionScheduleService.processStripeEvent(
          event.data,
        );

      case BillingWebhookEvent.PRODUCT_UPDATED:
      case BillingWebhookEvent.PRODUCT_CREATED:
        return await this.billingWebhookProductService.processStripeEvent(
          event.data,
        );
      case BillingWebhookEvent.CUSTOMER_ACTIVE_ENTITLEMENT_SUMMARY_UPDATED:
        return await this.billingWebhookEntitlementService.processStripeEvent(
          event.data,
        );

      case BillingWebhookEvent.ALERT_TRIGGERED:
        return await this.billingWebhookAlertService.processStripeEvent(
          event.data,
        );

      case BillingWebhookEvent.INVOICE_FINALIZED:
        return await this.billingWebhookInvoiceService.processStripeEvent(
          event.data,
        );

      case BillingWebhookEvent.CUSTOMER_CREATED:
        return await this.billingWebhookCustomerService.processStripeEvent(
          event.data,
        );

      case BillingWebhookEvent.CUSTOMER_SUBSCRIPTION_CREATED:
      case BillingWebhookEvent.CUSTOMER_SUBSCRIPTION_UPDATED:
      case BillingWebhookEvent.CUSTOMER_SUBSCRIPTION_DELETED: {
        const workspaceId = event.data.object.metadata?.workspaceId;

        if (!workspaceId) {
          throw new BillingException(
            'Workspace ID is required for subscription events',
            BillingExceptionCode.BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND,
          );
        }

        return await this.billingWebhookSubscriptionService.processStripeEvent(
          workspaceId,
          event,
        );
      }

      case BillingWebhookEvent.CREDIT_GRANT_CREATED:
      case BillingWebhookEvent.CREDIT_GRANT_UPDATED: {
        const customer = event.data.object.customer;
        // customer can be string ID, Customer object, or DeletedCustomer object
        const stripeCustomerId =
          typeof customer === 'string' ? customer : customer?.id;

        if (!stripeCustomerId) {
          throw new BillingException(
            'Customer ID is required for credit grant events',
            BillingExceptionCode.BILLING_CUSTOMER_EVENT_WORKSPACE_NOT_FOUND,
          );
        }

        return await this.billingWebhookCreditGrantService.processStripeEvent(
          stripeCustomerId,
        );
      }

      default:
        return {};
    }
  }
}
