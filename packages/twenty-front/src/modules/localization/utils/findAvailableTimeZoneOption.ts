import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } from '@/settings/experience/constants/AvailableTimezoneOptionsByLabel';

export const findAvailableTimeZoneOption = (value: string) =>
  AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL[formatTimeZoneLabel(value)];
