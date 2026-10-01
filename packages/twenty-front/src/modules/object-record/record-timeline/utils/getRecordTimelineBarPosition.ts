import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

export type RecordTimelineBarPosition = {
  startDayIndex: number;
  daySpan: number;
  startsBeforeWindow: boolean;
  endsAfterWindow: boolean;
};

export const getRecordTimelineBarPosition = ({
  startDay,
  endDay,
  windowFirstDay,
  windowLastDay,
}: {
  startDay: Temporal.PlainDate;
  endDay: Temporal.PlainDate | undefined;
  windowFirstDay: Temporal.PlainDate;
  windowLastDay: Temporal.PlainDate;
}): RecordTimelineBarPosition | undefined => {
  // A missing end date, or one before the start, renders as a one-day bar.
  const effectiveEndDay =
    isDefined(endDay) && Temporal.PlainDate.compare(endDay, startDay) >= 0
      ? endDay
      : startDay;

  if (
    Temporal.PlainDate.compare(effectiveEndDay, windowFirstDay) < 0 ||
    Temporal.PlainDate.compare(startDay, windowLastDay) > 0
  ) {
    return undefined;
  }

  const startsBeforeWindow =
    Temporal.PlainDate.compare(startDay, windowFirstDay) < 0;
  const endsAfterWindow =
    Temporal.PlainDate.compare(effectiveEndDay, windowLastDay) > 0;

  const visibleStartDay = startsBeforeWindow ? windowFirstDay : startDay;
  const visibleEndDay = endsAfterWindow ? windowLastDay : effectiveEndDay;

  return {
    startDayIndex: windowFirstDay.until(visibleStartDay, {
      largestUnit: 'days',
    }).days,
    daySpan:
      visibleStartDay.until(visibleEndDay, { largestUnit: 'days' }).days + 1,
    startsBeforeWindow,
    endsAfterWindow,
  };
};
