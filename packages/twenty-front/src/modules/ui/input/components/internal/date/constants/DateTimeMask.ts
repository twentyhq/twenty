import { TIME_MASK } from '@/ui/input/components/internal/date/constants/TimeMask';
import { DateFormat } from '~/modules/localization/constants/DateFormat';
import { getDateMask } from './DateMask';

export const getDateTimeMask = (dateFormat: DateFormat): string => {
  return `${getDateMask(dateFormat)} ${TIME_MASK}`;
};
