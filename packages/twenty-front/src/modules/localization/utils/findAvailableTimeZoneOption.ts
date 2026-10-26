import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } from '@/localization/constants/AvailableTimezoneOptionsByLabel';
import { AVAILABLE_TIME_ZONE_OPTIONS_REFERENCE_DATE } from '@/localization/constants/AvailableTimezoneOptionsReferenceDate';

export const findAvailableTimeZoneOption = (value: string) =>
  AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL[
    formatTimeZoneLabel({
      timeZone: value,
      referenceDate: AVAILABLE_TIME_ZONE_OPTIONS_REFERENCE_DATE,
    })
  ];
