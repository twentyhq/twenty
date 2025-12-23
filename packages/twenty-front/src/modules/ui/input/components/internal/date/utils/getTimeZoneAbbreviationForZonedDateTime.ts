import { type Temporal } from 'temporal-polyfill';

export const getTimezoneAbbreviationForZonedDateTime = (
  zonedDateTime: Temporal.ZonedDateTime,
) => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZoneName: 'short',
    timeZone: zonedDateTime.timeZoneId,
  }).formatToParts(new Date(zonedDateTime.toInstant().toString()));

  const timeZoneName = parts.filter((p) => p.type === 'timeZoneName')[0].value;

  return timeZoneName;
};
