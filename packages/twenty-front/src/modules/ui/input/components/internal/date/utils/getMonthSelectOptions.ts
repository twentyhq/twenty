import { isNonEmptyString } from '@sniptt/guards';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

const MONTH_COUNT = 12;

export const getMonthSelectOptions = (
  locale?: string,
): { label: string; value: number }[] => {
  const formatter = new Intl.DateTimeFormat(
    isNonEmptyString(locale) ? locale : SOURCE_LOCALE,
    { month: 'long' },
  );

  return Array.from({ length: MONTH_COUNT }, (_, index) => ({
    label: formatter.format(new Date(0, index, 1)),
    value: index + 1,
  }));
};
