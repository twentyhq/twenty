const getMonthName = (index: number): string =>
  new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
    new Date(0, index, 1),
  );

const getMonthNames = (monthNames: string[] = []): string[] => {
  if (monthNames.length === 12) return monthNames;

  return getMonthNames([...monthNames, getMonthName(monthNames.length)]);
};

export const getMonthSelectOptions = (): { label: string; value: number }[] =>
  getMonthNames().map((month, index) => ({
    label: month,
    value: index,
  }));
