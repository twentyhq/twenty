const MAX_TRIGGER_RETRY_LIMIT = 10;

export const resolveTriggerRetryLimit = ({
  declaredRetryLimit,
  defaultRetryLimit,
}: {
  declaredRetryLimit: number | undefined;
  defaultRetryLimit: number;
}): number => {
  if (
    typeof declaredRetryLimit !== 'number' ||
    !Number.isInteger(declaredRetryLimit) ||
    declaredRetryLimit < 0
  ) {
    return defaultRetryLimit;
  }

  return Math.min(declaredRetryLimit, MAX_TRIGGER_RETRY_LIMIT);
};
