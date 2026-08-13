import { isNonEmptyString } from '@sniptt/guards';

export const formatSlackUnfurlCurrencyAmount = ({
  amountMicros,
  currencyCode,
}: {
  amountMicros?: unknown;
  currencyCode?: string | null;
}): string | undefined => {
  const numericAmountMicros = Number(amountMicros);

  if (!Number.isFinite(numericAmountMicros)) {
    return undefined;
  }

  const amount = numericAmountMicros / 1_000_000;

  if (isNonEmptyString(currencyCode)) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      }).format(amount);
    } catch {
      return `${amount.toLocaleString('en-US')} ${currencyCode}`;
    }
  }

  return amount.toLocaleString('en-US');
};
