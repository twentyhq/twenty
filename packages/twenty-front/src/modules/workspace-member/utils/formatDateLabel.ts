import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { detectDateFormat } from '@/workspace-member/utils/detectDateFormat';

export const formatDateLabel = (dateFormat: string) => {
  //   switch (dateFormat) {
  //     case 'system':
  //       return detectDateFormat();
  //     case 'MMM_d_yyyy':
  //       return DateFormat.MonthFirst;
  //     case 'd_MMM_yyyy':
  //       return DateFormat.DayFirst;
  //     case 'yyyy_MMM_d':
  //       return DateFormat.YearFirst;
  //     default:
  //       return DateFormat.MonthFirst;
  //   }

  switch (dateFormat) {
    case 'system':
      return detectDateFormat();
    case DateFormat.MonthFirst:
      return DateFormat.MonthFirst;
    case DateFormat.DayFirst:
      return DateFormat.DayFirst;
    case DateFormat.YearFirst:
      return DateFormat.YearFirst;
    default:
      return DateFormat.MonthFirst;
  }
};
