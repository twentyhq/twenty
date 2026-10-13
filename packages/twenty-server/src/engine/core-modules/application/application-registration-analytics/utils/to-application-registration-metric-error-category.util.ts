import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationRegistrationMetricErrorCategory } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-error-category.type';

const LAMBDA_RUNTIME_ERROR_TYPE_PREFIX = 'Runtime.';

// An error name is set by the function's own code, so only server-produced names map to a specific category
// and everything else collapses to THROWN: the name itself must never reach the owner
export const toApplicationRegistrationMetricErrorCategory = (
  errorType: string | null | undefined,
): ApplicationRegistrationMetricErrorCategory => {
  if (!isNonEmptyString(errorType)) {
    return 'UNKNOWN';
  }

  if (errorType === 'TimeoutError') {
    return 'TIMEOUT';
  }

  if (errorType === 'Runtime.OutOfMemory') {
    return 'OUT_OF_MEMORY';
  }

  if (errorType.startsWith(LAMBDA_RUNTIME_ERROR_TYPE_PREFIX)) {
    return 'RUNTIME';
  }

  return 'THROWN';
};
