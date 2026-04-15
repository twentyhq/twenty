/* @license Enterprise */

import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';
import Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { getBillingExceptionStatusCode } from 'src/engine/core-modules/billing/utils/get-billing-exception-status-code.util';
import { type CustomException } from 'src/utils/custom-exception';

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
        } as CustomException,
        response,
        400,
      );
    }

    return this.httpExceptionHandlerService.handleError(
      exception,
      response,
      getBillingExceptionStatusCode(exception),
    );
  }
}
