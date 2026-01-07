import { type TimeFormat } from '@/localization/constants/TimeFormat';

import { isDefined } from 'twenty-shared/utils';

export const detectTimeFormat = (): keyof typeof TimeFormat => {
  try {
    const isHour12 = Intl.DateTimeFormat(navigator?.language || 'en-US', {
      hour: 'numeric',
    }).resolvedOptions().hour12;

    if (isDefined(isHour12) && isHour12) {
      return 'HOUR_12';
    }

    return 'HOUR_24';
  } catch {
    return 'HOUR_24';
  }
};
