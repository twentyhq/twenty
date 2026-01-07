const getMonthName = (index: number, locale?: string): string =>
  new Intl.DateTimeFormat(locale || 'en-US', { month: 'long' }).format(
    new Date(0, index, 1),
  );

const getMonthNames = (
  locale?: string,
  monthNames: string[] = [],
): string[] => {
  if (monthNames.length === 12) return monthNames;

  return getMonthNames(locale, [
    ...monthNames,
    getMonthName(monthNames.length, locale),
  ]);
};

export const getMonthSelectOptions = (
  locale?: string,
): { label: string; value: number }[] =>
  getMonthNames(locale).map((month, index) => ({
    label: month,
    value: index + 1,
  }));
