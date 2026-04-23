import { type DateFormat } from '@/localization/constants/DateFormat';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { getDateMask } from './getDateMask';
import { getTimeMask } from './getTimeMask';

export const getDateTimeMask = ({
  dateFormat,
  timeFormat,
}: {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
}): string => {
  return `${getDateMask(dateFormat)} ${getTimeMask(timeFormat)}`;
};
