import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';

export const withHealthCheckTimeout = async <T>(
  promise: Promise<T>,
  errorMessage: string,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(errorMessage)),
        HEALTH_INDICATORS_TIMEOUT,
      ),
    ),
  ]);
};
