/* @license Enterprise */

import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import { type GqlContextType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { type Response } from 'express';
import Stripe from 'stripe';

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { sendHttpExceptionResponse } from 'src/engine/core-modules/exception-handler/utils/send-http-exception-response.util';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(Stripe.errors.StripeError)
export class StripeErrorFilter implements ExceptionFilter {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  catch(exception: Stripe.errors.StripeError, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() === 'graphql') {
      return new InternalServerError(exception.message, {
        subCode: BillingExceptionCode.BILLING_STRIPE_ERROR,
        userFriendlyMessage: msg`A payment processing error occurred.`,
      });
    }

    return sendHttpExceptionResponse({
      exception,
      response: host.switchToHttp().getResponse<Response>(),
      fallbackStatusCode: 400,
      exceptionHandlerService: this.exceptionHandlerService,
    });
  }
}
