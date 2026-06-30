export const normalizePriceRef = (
  priceRef: string | { id: string },
): string => {
  return typeof priceRef === 'string' ? priceRef : priceRef.id;
};
