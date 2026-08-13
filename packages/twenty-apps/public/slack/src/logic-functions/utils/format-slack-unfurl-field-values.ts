import { isNonEmptyString } from '@sniptt/guards';

export const formatSlackUnfurlSelectValue = (
  value: string,
): string | undefined => {
  const words = value.toLowerCase().split('_').filter(isNonEmptyString);

  if (words.length === 0) {
    return undefined;
  }

  const [firstWord, ...remainingWords] = words;

  return [
    firstWord.charAt(0).toUpperCase() + firstWord.slice(1),
    ...remainingWords,
  ].join(' ');
};

export const formatSlackUnfurlDate = (value: string): string | undefined => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

export const formatSlackUnfurlCurrencyAmount = ({
  amountMicros,
  currencyCode,
}: {
  amountMicros: unknown;
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
