import { TimeFormat } from '@/localization/constants/TimeFormat';
import { isDefined } from '~/utils/isDefined';

export const detectTimeFormat = () => {
  const isHour12 = Intl.DateTimeFormat(navigator.language, {
    hour: 'numeric',
  }).resolvedOptions().hour12;
  if (isDefined(isHour12) && isHour12) return TimeFormat.HOUR_12;
  return TimeFormat.HOUR_24;
};
