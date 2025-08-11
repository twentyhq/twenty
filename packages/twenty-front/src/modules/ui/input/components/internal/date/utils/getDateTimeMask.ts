import { TIME_MASK } from '@/ui/input/components/internal/date/constants/TimeMask';

import { type DateFormat } from '@/localization/constants/DateFormat';
import { getDateMask } from './getDateMask';

export const getDateTimeMask = (dateFormat: DateFormat): string => {
  return `${getDateMask(dateFormat)} ${TIME_MASK}`;
};
