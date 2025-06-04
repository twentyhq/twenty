export const getPriceFromStripeDecimal = (priceStr: string): number => {
  if (!priceStr || Number.isNaN(+priceStr)) {
    throw new Error('Invalid price string.');
  }

  const price = Number(priceStr);

  return price / 100;
};
