import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeFormat } from '@/workspace-member/utils/detectTimeFormat';

export const formatTimeLabel = (timeFormat: string) => {
  //   switch (timeFormat) {
  //     case 'system':
  //       return detectTimeFormat();
  //     case 'HH_mm':
  //       return TimeFormat.Military;
  //     case 'h_mm_aa':
  //       return TimeFormat.Standard;
  //     default:
  //       return TimeFormat.Military;
  //   }
  switch (timeFormat) {
    case 'system':
      return detectTimeFormat();
    case TimeFormat.Military:
      return TimeFormat.Military;
    case TimeFormat.Standard:
      return TimeFormat.Standard;
    default:
      return TimeFormat.Military;
  }
};
