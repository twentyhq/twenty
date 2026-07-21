export const computeMaximumJoinAt = (joinAt: string): string => {
  const joinAtDate = new Date(joinAt);
  const nowPlusOneSecond = new Date(Date.now() + 1_000);

  return new Date(
    Math.max(joinAtDate.getTime(), nowPlusOneSecond.getTime()),
  ).toISOString();
};
