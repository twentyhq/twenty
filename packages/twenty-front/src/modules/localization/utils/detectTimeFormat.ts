import { TimeFormat } from '@/localization/constants/TimeFormat';
import { isDefined } from '~/utils/isDefined';

export const detectTimeFormat = (): keyof typeof TimeFormat => {
  const isHour12 = Intl.DateTimeFormat(navigator.language, {
    hour: 'numeric',
  }).resolvedOptions().hour12;

  if (isDefined(isHour12) && isHour12) {
    return 'HOUR_12';
  }

  return 'HOUR_24';
};
