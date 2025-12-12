import { type Temporal } from 'temporal-polyfill';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { getNextPeriodStart, getPeriodStart } from 'twenty-shared/utils';

export const formatDateByGranularity = (
  plainDate: Temporal.PlainDate,
  granularity:
    | ObjectRecordGroupByDateGranularity.DAY
    | ObjectRecordGroupByDateGranularity.MONTH
    | ObjectRecordGroupByDateGranularity.QUARTER
    | ObjectRecordGroupByDateGranularity.YEAR
    | ObjectRecordGroupByDateGranularity.WEEK
    | ObjectRecordGroupByDateGranularity.NONE,
  userTimezone: string,
  // userLocale: string,
): string => {
  console.log({ plainDate });

  // const plainDate = Temporal.Instant.from(String(dayString)).toZonedDateTimeISO(
  //   'UTC',
  // );

  console.log({
    plainDate,
  });

  switch (granularity) {
    case ObjectRecordGroupByDateGranularity.DAY:
      return plainDate.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    case ObjectRecordGroupByDateGranularity.WEEK: {
      const startOfWeek = getPeriodStart(
        plainDate.toZonedDateTime(userTimezone),
        'WEEK',
      );

      const endOfWeek = getNextPeriodStart(
        plainDate.toZonedDateTime(userTimezone),
        'WEEK',
      ).subtract({ days: 1 });

      const startMonth = startOfWeek.toLocaleString(undefined, {
        month: 'short',
      });
      const endMonth = endOfWeek.toLocaleString(undefined, {
        month: 'short',
      });
      const startDay = startOfWeek.day;
      const endDay = endOfWeek.day;
      const startYear = startOfWeek.year;
      const endYear = endOfWeek.year;

      if (startYear !== endYear) {
        return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
      }

      if (startMonth !== endMonth) {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
      }

      return `${startMonth} ${startDay} - ${endDay}, ${endYear}`;
    }
    case ObjectRecordGroupByDateGranularity.MONTH:
      return plainDate.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
      });
    case ObjectRecordGroupByDateGranularity.QUARTER:
      return `Q${Math.floor(plainDate.month / 3) + 1} ${plainDate.year}`;
    case ObjectRecordGroupByDateGranularity.YEAR:
      return plainDate.year.toString();
    case ObjectRecordGroupByDateGranularity.NONE:
    default:
      return plainDate.toLocaleString();
  }
};
