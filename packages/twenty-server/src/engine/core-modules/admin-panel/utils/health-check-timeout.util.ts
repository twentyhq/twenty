import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/admin-panel/constants/health-indicators-timeout.conts';
import { withDeadline } from 'src/utils/with-deadline';

export const withHealthCheckTimeout = async <T>(
  promise: Promise<T>,
  errorMessage: string,
): Promise<T> => {
  return withDeadline({
    promise,
    timeoutMs: HEALTH_INDICATORS_TIMEOUT,
    createTimeoutError: () => new Error(errorMessage),
  });
};
