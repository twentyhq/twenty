import { detectTimeFormat } from '@/localization/utils/detection/detectTimeFormat';
import { type Temporal } from 'temporal-polyfill';
import { WorkspaceMemberTimeFormatEnum } from '~/generated/graphql';

export const formatZonedDateTimeTimePart = (
  zonedDateTime: Temporal.ZonedDateTime,
  dateFormat: WorkspaceMemberTimeFormatEnum,
): string => {
  const h24 = zonedDateTime.hour.toString().padStart(2, '0');
  const m = zonedDateTime.minute.toString().padStart(2, '0');

  switch (dateFormat) {
    case WorkspaceMemberTimeFormatEnum.SYSTEM: {
      const detectedFormat = WorkspaceMemberTimeFormatEnum[detectTimeFormat()];

      return formatZonedDateTimeTimePart(zonedDateTime, detectedFormat);
    }
    case WorkspaceMemberTimeFormatEnum.HOUR_12: {
      const hour12 = zonedDateTime.hour % 12 || 12;
      const suffix = zonedDateTime.hour < 12 ? 'AM' : 'PM';

      return `${hour12}:${m} ${suffix}`;
    }
    case WorkspaceMemberTimeFormatEnum.HOUR_24: {
      return `${h24}:${m}`;
    }
  }
};
