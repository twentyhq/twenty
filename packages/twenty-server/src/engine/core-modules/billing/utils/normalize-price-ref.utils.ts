export function normalizePriceRef(
  p: string | { id: string } | null | undefined,
): string | undefined {
  if (!p) return undefined;

  return typeof p === 'string' ? p : p.id;
}
