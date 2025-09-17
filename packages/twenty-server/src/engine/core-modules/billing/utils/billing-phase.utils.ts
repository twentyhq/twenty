/* @license Enterprise */

export function normalizePriceRef(
  p: string | { id: string } | null | undefined,
): string | undefined {
  if (!p) return undefined;

  return typeof p === 'string' ? p : p.id;
}

export function ensureFutureStartDate(
  ...dates: Array<number | undefined | null>
): number {
  const now = Math.floor(Date.now() / 1000);

  return Math.max(...dates.map((d) => d ?? 0), now + 1);
}
