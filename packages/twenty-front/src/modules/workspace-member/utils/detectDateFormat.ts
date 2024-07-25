import { DateFormat } from '@/settings/accounts/constants/DateFormat';

export const detectDateFormat = () => {
  const date = new Date(Date.UTC(2012, 11, 9, 3, 0, 0));
  // 2012 - year
  // 11 - month
  // 9 - day
  const dateString = date.toLocaleString(navigator.language, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  switch (dateString.charAt(0)) {
    case '1':
      return DateFormat.MonthFirst;
    case '9':
      return DateFormat.DayFirst;
    case '2':
      return DateFormat.YearFirst;
    default:
      return DateFormat.MonthFirst;
  }
};
