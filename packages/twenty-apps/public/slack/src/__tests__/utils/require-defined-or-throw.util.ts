export const requireDefinedOrThrow = <TValue>(
  value: TValue | undefined,
  errorMessage: string,
): TValue => {
  if (value === undefined) {
    throw new Error(errorMessage);
  }

  return value;
};
