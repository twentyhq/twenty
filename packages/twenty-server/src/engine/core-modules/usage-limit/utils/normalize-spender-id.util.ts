// The entity stores '' for "every spender" so the unique index can match it;
// outward shapes carry null instead.
export const normalizeSpenderId = (spenderId: string): string | null =>
  spenderId === '' ? null : spenderId;
