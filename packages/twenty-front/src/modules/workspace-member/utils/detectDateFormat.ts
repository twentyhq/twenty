import { DateFormat } from '@/workspace-member/constants/DateFormat';

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
      return DateFormat.MONTH_FIRST;
    case '9':
      return DateFormat.DAY_FIRST;
    case '2':
      return DateFormat.YEAR_FIRST;
    default:
      return DateFormat.MONTH_FIRST;
  }
};
