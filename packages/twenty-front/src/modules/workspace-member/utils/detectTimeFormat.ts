import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { isDefined } from '~/utils/isDefined';

export const detectTimeFormat = () => {
  const isHour12 = Intl.DateTimeFormat(navigator.language, {
    hour: 'numeric',
  }).resolvedOptions().hour12;
  if (isDefined(isHour12) && isHour12) return TimeFormat['12h'];
  return TimeFormat['24h'];
};
