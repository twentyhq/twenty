import { DateFormat } from '@/localization/constants/DateFormat';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { type Temporal } from 'temporal-polyfill';

export const useParseZonedDateTimeToIMaskDateTimeInputString = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseZonedDateTimeToDateTimeInputString = (
    zonedDateTime: Temporal.ZonedDateTime,
  ) => {
    switch (dateFormat) {
      case DateFormat.DAY_FIRST: {
        return zonedDateTime.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
      case DateFormat.YEAR_FIRST: {
        return zonedDateTime.toLocaleString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
      case DateFormat.SYSTEM:
      case DateFormat.MONTH_FIRST: {
        return zonedDateTime.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
    }
  };

  return {
    parseZonedDateTimeToDateTimeInputString,
  };
};
