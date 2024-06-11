import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeFormat } from '@/workspace-member/utils/detectTimeFormat';

export const formatTimeLabel = (timeFormat: string) => {
  switch (timeFormat) {
    case 'system':
      return detectTimeFormat();
    case 'HH_mm':
      return TimeFormat.MILITARY;
    case 'h_mm_aa':
      return TimeFormat.STANDARD;
    default:
      return TimeFormat.MILITARY;
  }
};
