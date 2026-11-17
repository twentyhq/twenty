import { isUndefined } from '@sniptt/guards';

import { UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE } from 'src/logic-functions/constants/upcoming-calendar-event-reconciliation-batch-size';
import { type UpcomingCalendarEvent } from 'src/logic-functions/types/upcoming-calendar-event.type';

type StartsAtGroup = {
  startsAt: string | undefined;
  calendarEventIds: string[];
};

const getUniqueUpcomingCalendarEvents = (
  upcomingCalendarEvents: UpcomingCalendarEvent[],
): UpcomingCalendarEvent[] => [
  ...upcomingCalendarEvents
    .reduce(
      (upcomingCalendarEventsById, upcomingCalendarEvent) =>
        upcomingCalendarEventsById.has(upcomingCalendarEvent.id)
          ? upcomingCalendarEventsById
          : upcomingCalendarEventsById.set(
              upcomingCalendarEvent.id,
              upcomingCalendarEvent,
            ),
      new Map<string, UpcomingCalendarEvent>(),
    )
    .values(),
];

const groupCalendarEventIdsByStartsAt = (
  upcomingCalendarEvents: UpcomingCalendarEvent[],
): StartsAtGroup[] =>
  [
    ...upcomingCalendarEvents
      .reduce(
        (calendarEventIdsByStartsAt, upcomingCalendarEvent) =>
          calendarEventIdsByStartsAt.set(upcomingCalendarEvent.startsAt, [
            ...(calendarEventIdsByStartsAt.get(
              upcomingCalendarEvent.startsAt,
            ) ?? []),
            upcomingCalendarEvent.id,
          ]),
        new Map<string | undefined, string[]>(),
      )
      .entries(),
  ].map(([startsAt, calendarEventIds]) => ({ startsAt, calendarEventIds }));

const getStartsAtGroupTimestamp = (
  startsAtGroup: Pick<StartsAtGroup, 'startsAt'>,
): number =>
  isUndefined(startsAtGroup.startsAt)
    ? Number.POSITIVE_INFINITY
    : Date.parse(startsAtGroup.startsAt);

const sortStartsAtGroupsSoonestFirst = (
  startsAtGroups: StartsAtGroup[],
): StartsAtGroup[] =>
  [...startsAtGroups].sort(
    (firstStartsAtGroup, secondStartsAtGroup) =>
      getStartsAtGroupTimestamp(firstStartsAtGroup) -
      getStartsAtGroupTimestamp(secondStartsAtGroup),
  );

const appendStartsAtGroupToBatches = ({
  batches,
  startsAtGroup,
}: {
  batches: string[][];
  startsAtGroup: Pick<StartsAtGroup, 'calendarEventIds'>;
}): string[][] => {
  const lastBatch: string[] | undefined = batches[batches.length - 1];

  if (
    isUndefined(lastBatch) ||
    lastBatch.length + startsAtGroup.calendarEventIds.length >
      UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE
  ) {
    return [...batches, startsAtGroup.calendarEventIds];
  }

  return [
    ...batches.slice(0, -1),
    [...lastBatch, ...startsAtGroup.calendarEventIds],
  ];
};

export const groupUpcomingCalendarEventIdsIntoBatches = (
  upcomingCalendarEvents: UpcomingCalendarEvent[],
): string[][] =>
  sortStartsAtGroupsSoonestFirst(
    groupCalendarEventIdsByStartsAt(
      getUniqueUpcomingCalendarEvents(upcomingCalendarEvents),
    ),
  ).reduce<string[][]>(
    (batches, startsAtGroup) =>
      appendStartsAtGroupToBatches({ batches, startsAtGroup }),
    [],
  );
