import { formatInTimeZone } from 'date-fns-tz';
import { doNotTranslate } from 'twenty-shared/i18n';

// 'America/Los_Angeles' => 'America/Los Angeles (GMT-08:00)'
export const formatIanaTimeZoneLabel = ({
  timeZone,
  referenceDate = new Date(),
}: {
  timeZone: string;
  referenceDate?: Date;
}) => {
  try {
    const offset = formatInTimeZone(
      referenceDate,
      timeZone,
      doNotTranslate('OOOO'),
    );

    return `${timeZone.replaceAll('_', ' ')} (${offset})`;
  } catch {
    return timeZone;
  }
};
