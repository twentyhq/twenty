import { TimeFormat } from '@/localization/constants/TimeFormat';
import { doNotTranslate } from 'twenty-shared/utils';

export const getTimeMask = (timeFormat: TimeFormat): string => {
  return doNotTranslate(
    timeFormat === TimeFormat.HOUR_12 ? 'HH`:mm` `aa' : 'HH`:mm`',
  );
};
