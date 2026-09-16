import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';

import { isBillingPlanRequiredError } from '@/apollo/utils/isBillingPlanRequiredError';

const buildGraphqlError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'refused', extensions }],
  });

const buildServerError = ({
  statusCode,
  body,
}: {
  statusCode: number;
  body?: Record<string, unknown>;
}) =>
  new ServerError('Payment Required', {
    statusCode,
    response: { status: statusCode } as Response,
    bodyText: JSON.stringify(body ?? {}),
  });

describe('isBillingPlanRequiredError', () => {
  it('detects GraphQL subCode BILLING_PLAN_REQUIRED under FORBIDDEN', () => {
    expect(
      isBillingPlanRequiredError(
        buildGraphqlError({
          code: 'FORBIDDEN',
          subCode: 'BILLING_PLAN_REQUIRED',
        }),
      ),
    ).toBe(true);
  });

  it('detects GraphQL code BILLING_PLAN_REQUIRED', () => {
    expect(
      isBillingPlanRequiredError(
        buildGraphqlError({ code: 'BILLING_PLAN_REQUIRED' }),
      ),
    ).toBe(true);
  });

  it('detects a single GraphQLFormattedError-shaped object via subCode', () => {
    expect(
      isBillingPlanRequiredError({
        message: 'Workspace subscription is required',
        extensions: {
          code: 'FORBIDDEN',
          subCode: 'BILLING_PLAN_REQUIRED',
        },
      }),
    ).toBe(true);
  });

  it('rejects unrelated billing / auth codes', () => {
    expect(
      isBillingPlanRequiredError(
        buildGraphqlError({
          code: 'FORBIDDEN',
          subCode: 'BILLING_CREDITS_EXHAUSTED',
        }),
      ),
    ).toBe(false);

    expect(
      isBillingPlanRequiredError(
        buildGraphqlError({
          code: 'FORBIDDEN',
          subCode: 'BILLING_SUBSCRIPTION_INACTIVE',
        }),
      ),
    ).toBe(false);

    expect(
      isBillingPlanRequiredError(
        buildGraphqlError({ code: 'UNAUTHENTICATED' }),
      ),
    ).toBe(false);

    expect(isBillingPlanRequiredError(new Error('boom'))).toBe(false);
  });

  it('detects REST 402 only when body code is BILLING_PLAN_REQUIRED', () => {
    expect(
      isBillingPlanRequiredError(
        buildServerError({
          statusCode: 402,
          body: { code: 'BILLING_PLAN_REQUIRED', statusCode: 402 },
        }),
      ),
    ).toBe(true);

    expect(
      isBillingPlanRequiredError(
        buildServerError({
          statusCode: 402,
          body: { code: 'BILLING_CREDITS_EXHAUSTED', statusCode: 402 },
        }),
      ),
    ).toBe(false);

    expect(
      isBillingPlanRequiredError(
        buildServerError({ statusCode: 402, body: {} }),
      ),
    ).toBe(false);

    expect(
      isBillingPlanRequiredError(
        buildServerError({
          statusCode: 401,
          body: { code: 'BILLING_PLAN_REQUIRED' },
        }),
      ),
    ).toBe(false);
  });
});
