/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { billingGraphqlApiExceptionHandler } from 'src/engine/core-modules/billing/utils/billing-graphql-api-exception-handler.util';
import {
  ErrorCode,
  type BaseGraphQLError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const catchGraphqlError = (error: Error): BaseGraphQLError => {
  try {
    billingGraphqlApiExceptionHandler(error);
    throw new Error('Expected billingGraphqlApiExceptionHandler to throw');
  } catch (graphqlError) {
    return graphqlError as BaseGraphQLError;
  }
};

describe('billingGraphqlApiExceptionHandler', () => {
  it('maps credits exhausted to a GraphQL error with the billing subCode', () => {
    const error = new BillingException(
      'Credits exhausted',
      BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
    );

    const graphqlError = catchGraphqlError(error);

    expect(graphqlError.extensions.code).toBe(ErrorCode.FORBIDDEN);
    expect(graphqlError.extensions.subCode).toBe(
      BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
    );
    expect(graphqlError.extensions.userFriendlyMessage).toBeDefined();
  });

  it('maps billing not found errors to NOT_FOUND', () => {
    const error = new BillingException(
      'Billing product not found',
      BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
    );

    const graphqlError = catchGraphqlError(error);

    expect(graphqlError.extensions.code).toBe(ErrorCode.NOT_FOUND);
    expect(graphqlError.extensions.subCode).toBe(
      BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
    );
  });

  it('maps internal billing failures to INTERNAL_SERVER_ERROR', () => {
    const error = new BillingException(
      'Invalid price tiers',
      BillingExceptionCode.BILLING_PRICE_INVALID_TIERS,
    );

    const graphqlError = catchGraphqlError(error);

    expect(graphqlError.extensions.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    expect(graphqlError.extensions.subCode).toBe(
      BillingExceptionCode.BILLING_PRICE_INVALID_TIERS,
    );
  });
});
