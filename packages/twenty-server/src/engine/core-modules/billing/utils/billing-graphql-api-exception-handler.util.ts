/* @license Enterprise */

import { msg } from '@lingui/core/macro';
import Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { getBillingExceptionStatusCode } from 'src/engine/core-modules/billing/utils/get-billing-exception-status-code.util';

export const billingGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof Stripe.errors.StripeError) {
    throw new InternalServerError(error.message, {
      subCode: BillingExceptionCode.BILLING_STRIPE_ERROR,
      userFriendlyMessage: msg`A payment processing error occurred.`,
    });
  }

  if (error instanceof BillingException) {
    switch (getBillingExceptionStatusCode(error)) {
      case 404:
        throw new NotFoundError(error);
      case 400:
        throw new UserInputError(error);
      case 402:
        throw new ForbiddenError(error);
      case 500:
        throw new InternalServerError(error);
    }
  }

  throw error;
};
