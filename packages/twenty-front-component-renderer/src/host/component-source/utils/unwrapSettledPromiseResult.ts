export const unwrapSettledPromiseResult = <TValue>(
  settledPromiseResult: PromiseSettledResult<TValue>,
): TValue => {
  if (settledPromiseResult.status === 'rejected') {
    throw settledPromiseResult.reason;
  }

  return settledPromiseResult.value;
};
