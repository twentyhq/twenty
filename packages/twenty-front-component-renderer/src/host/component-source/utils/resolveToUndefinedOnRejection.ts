export const resolveToUndefinedOnRejection = async <TValue>(
  promise: Promise<TValue>,
): Promise<TValue | undefined> => {
  try {
    return await promise;
  } catch {
    return undefined;
  }
};
