import {
  CURRENCY_CODE_LABELS,
  type CurrencyCode,
} from 'twenty-shared/constants';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

export const getCurrencyLabel = ({
  currencyCode,
  locale,
}: {
  currencyCode: CurrencyCode;
  locale: string;
}): string => {
  const sourceLocaleLabel = CURRENCY_CODE_LABELS[currencyCode].label;

  // The record search matches typed text against these source labels, so the source locale keeps them
  if (locale === SOURCE_LOCALE) {
    return sourceLocaleLabel;
  }

  try {
    return (
      new Intl.DisplayNames([locale], {
        type: 'currency',
        fallback: 'none',
      }).of(currencyCode) ?? sourceLocaleLabel
    );
  } catch {
    return sourceLocaleLabel;
  }
};
