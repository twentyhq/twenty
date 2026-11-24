import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

export const getChatMessageDayKey = ({
  createdAt,
  timeZone,
}: {
  createdAt: Date | string | undefined;
  timeZone: string;
}): string | undefined =>
  isDefined(createdAt)
    ? Temporal.Instant.fromEpochMilliseconds(new Date(createdAt).getTime())
        .toZonedDateTimeISO(timeZone)
        .toPlainDate()
        .toString()
    : undefined;
