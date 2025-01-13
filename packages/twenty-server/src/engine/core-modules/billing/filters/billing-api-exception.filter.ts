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

  catch(exception: BillingException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
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
