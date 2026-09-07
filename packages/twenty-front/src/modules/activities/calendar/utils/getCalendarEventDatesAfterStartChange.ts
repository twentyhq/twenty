import { Temporal } from 'temporal-polyfill';

export const getCalendarEventDatesAfterStartChange = ({
  dates,
  startsAt,
  isFullDay,
}: {
  dates: { startsAt: string; endsAt: string };
  startsAt: string;
  isFullDay: boolean;
}) => {
  if (isFullDay) {
    return {
      startsAt,
      endsAt:
        dates.endsAt > startsAt
          ? dates.endsAt
          : Temporal.PlainDate.from(startsAt).add({ days: 1 }).toString(),
    };
  }

  return {
    startsAt,
    endsAt:
      Date.parse(dates.endsAt) > Date.parse(startsAt)
        ? dates.endsAt
        : Temporal.Instant.from(startsAt).add({ hours: 1 }).toString(),
  };
};
