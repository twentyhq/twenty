import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';
import { type Temporal } from 'temporal-polyfill';
import { WorkspaceMemberDateFormatEnum } from '~/generated-metadata/graphql';

export const formatZonedDateTimeDatePart = (
  zonedDateTime: Temporal.ZonedDateTime,
  dateFormat: WorkspaceMemberDateFormatEnum,
  calendarSystem: CalendarSystem,
): string => {
  const calendarZonedDateTime = zonedDateTime.withCalendar(calendarSystem);
  const MMM = zonedDateTime.toLocaleString('en-US', {
    month: 'short',
    calendar: calendarSystem,
  });
  const d = calendarZonedDateTime.day;
  const yyyy = calendarZonedDateTime.year;

  switch (dateFormat) {
    case WorkspaceMemberDateFormatEnum.SYSTEM: {
      const detectedFormat = WorkspaceMemberDateFormatEnum[detectDateFormat()];

      return formatZonedDateTimeDatePart(
        zonedDateTime,
        detectedFormat,
        calendarSystem,
      );
    }
    case WorkspaceMemberDateFormatEnum.MONTH_FIRST:
      return `${MMM} ${d}, ${yyyy}`;
    case WorkspaceMemberDateFormatEnum.DAY_FIRST:
      return `${d} ${MMM}, ${yyyy}`;
    case WorkspaceMemberDateFormatEnum.YEAR_FIRST:
      return `${yyyy} ${MMM} ${d}`;
  }
};
