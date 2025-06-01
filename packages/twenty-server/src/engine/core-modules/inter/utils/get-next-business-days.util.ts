import { addBusinessDays, format } from 'date-fns';

export const getNextBusinessDays = (days: number): string => {
  const currentDate = new Date();
  const resultDate = addBusinessDays(currentDate, days);

  return format(resultDate, 'yyyy-MM-dd');
};
