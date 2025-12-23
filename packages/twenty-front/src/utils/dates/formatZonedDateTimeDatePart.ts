import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';
import { type Temporal } from 'temporal-polyfill';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

export const formatZonedDateTimeDatePart = (
  zonedDateTime: Temporal.ZonedDateTime,
  dateFormat: WorkspaceMemberDateFormatEnum,
): string => {
  const MMM = zonedDateTime.toLocaleString('en-US', { month: 'short' });
  const d = zonedDateTime.day;
  const yyyy = zonedDateTime.year;

  switch (dateFormat) {
    case WorkspaceMemberDateFormatEnum.SYSTEM: {
      const detectedFormat = WorkspaceMemberDateFormatEnum[detectDateFormat()];

      return formatZonedDateTimeDatePart(zonedDateTime, detectedFormat);
    }
    case WorkspaceMemberDateFormatEnum.MONTH_FIRST:
      return `${MMM} ${d}, ${yyyy}`;
    case WorkspaceMemberDateFormatEnum.DAY_FIRST:
      return `${d} ${MMM}, ${yyyy}`;
    case WorkspaceMemberDateFormatEnum.YEAR_FIRST:
      return `${yyyy} ${MMM} ${d}`;
  }
};
