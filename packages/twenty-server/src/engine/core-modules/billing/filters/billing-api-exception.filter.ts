/* @license Enterprise */

import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { Response } from 'express';
import Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

@Catch(BillingException, Stripe.errors.StripeError)
export class BillingRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(
    exception: BillingException | Stripe.errors.StripeError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof Stripe.errors.StripeError) {
      return this.httpExceptionHandlerService.handleError(
        {
          code: BillingExceptionCode.BILLING_STRIPE_ERROR,
          message: exception.message,
          name: 'StripeError',
        },
        response,
        400,
      );
    }

    switch (exception.code) {
      case BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND:
      case BillingExceptionCode.BILLING_ACTIVE_SUBSCRIPTION_NOT_FOUND:
      case BillingExceptionCode.BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND:
      case BillingExceptionCode.BILLING_CUSTOMER_EVENT_WORKSPACE_NOT_FOUND:
      case BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND:
      case BillingExceptionCode.BILLING_PLAN_NOT_FOUND:
      case BillingExceptionCode.BILLING_METER_NOT_FOUND:
      case BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case BillingExceptionCode.BILLING_METER_EVENT_FAILED:
      case BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD:
      case BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          400,
        );
      default:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          500,
        );
    }
  }
}
