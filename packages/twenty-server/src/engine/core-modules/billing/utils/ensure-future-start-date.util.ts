export function ensureFutureStartDate(
  ...dates: Array<number | undefined | null>
): number {
  const now = Math.floor(Date.now() / 1000);

  return Math.max(...dates.map((d) => d ?? 0), now + 1);
}
