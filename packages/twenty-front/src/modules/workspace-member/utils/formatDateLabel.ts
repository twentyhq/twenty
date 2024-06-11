import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { detectDateFormat } from '@/workspace-member/utils/detectDateFormat';

export const formatDateLabel = (dateFormat: string) => {
  switch (dateFormat) {
    case 'system':
      return detectDateFormat();
    case 'MMM_d_yyyy':
      return DateFormat.MONTH_FIRST;
    case 'd_MMM_yyyy':
      return DateFormat.DAY_FIRST;
    case 'yyyy_MMM_d':
      return DateFormat.YEAR_FIRST;
    default:
      return DateFormat.MONTH_FIRST;
  }
};
