// The entity stores '' for a limit with no spenderId so the unique index can
// match it; outward shapes carry null instead. Such a limit is one pool shared
// by every spender of its type, not a per-spender default: the counter key
// carries no spender id and the warm sums every spender's consumption.
export const normalizeSpenderId = (spenderId: string): string | null =>
  spenderId === '' ? null : spenderId;
