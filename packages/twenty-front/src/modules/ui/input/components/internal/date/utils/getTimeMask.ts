import { TimeFormat } from '@/localization/constants/TimeFormat';

export const getTimeMask = (timeFormat: TimeFormat): string => {
  return timeFormat === TimeFormat.HOUR_12 ? 'HH`:mm` `aa' : 'HH`:mm`';
};
