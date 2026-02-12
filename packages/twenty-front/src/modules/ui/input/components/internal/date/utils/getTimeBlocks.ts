import { TimeFormat } from '@/localization/constants/TimeFormat';
import { IMask } from 'react-imask';

export const getTimeBlocks = (timeFormat: TimeFormat) => {
  const isHour12 = timeFormat === TimeFormat.HOUR_12;

  return {
    HH: {
      mask: IMask.MaskedRange,
      from: isHour12 ? 1 : 0,
      to: isHour12 ? 12 : 23,
      maxLength: 2,
    },
    mm: {
      mask: IMask.MaskedRange,
      from: 0,
      to: 59,
      maxLength: 2,
    },
    aa: {
      mask: '**',
    },
  };
};
