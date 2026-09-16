import { ServerError } from '@apollo/client/errors';
import { isDefined } from 'twenty-shared/utils';

import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const BILLING_PLAN_REQUIRED_ERROR_CODE = 'BILLING_PLAN_REQUIRED';

const parseRestErrorBody = (bodyText: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(bodyText);

    if (isDefined(parsed) && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * True when GraphQL extensions (subCode/code) or REST 402 body report
 * BILLING_PLAN_REQUIRED. Bare HTTP 402 is not enough — other billing codes
 * share 402.
 */
export const isBillingPlanRequiredError = (error: unknown): boolean => {
  if (isGraphqlErrorOfType(error, BILLING_PLAN_REQUIRED_ERROR_CODE)) {
    return true;
  }

  if (ServerError.is(error) && error.statusCode === 402) {
    const body = parseRestErrorBody(error.bodyText ?? '');

    return body?.code === BILLING_PLAN_REQUIRED_ERROR_CODE;
  }

  return false;
};
