import { getPlainDateStartOfWeek } from '@/localization/utils/getPlainDateStartOfWeek';
import { type RecordTimelineZoom } from '@/object-record/record-timeline/types/RecordTimelineZoom';
import { type Temporal } from 'temporal-polyfill';

export const getRecordTimelineWindow = ({
  anchorDate,
  zoom,
  weekStartsOnDayIndex,
}: {
  anchorDate: Temporal.PlainDate;
  zoom: RecordTimelineZoom;
  weekStartsOnDayIndex: number;
}) => {
  const firstDay = (() => {
    switch (zoom) {
      case 'WEEK':
        return getPlainDateStartOfWeek({
          day: anchorDate,
          weekStartsOnDayIndex,
        });
      case 'MONTH':
        return anchorDate.with({ day: 1 });
      case 'QUARTER':
        return anchorDate.with({
          month: anchorDate.month - ((anchorDate.month - 1) % 3),
          day: 1,
        });
    }
  })();

  const lastDay = (() => {
    switch (zoom) {
      case 'WEEK':
        return firstDay.add({ days: 6 });
      case 'MONTH':
        return firstDay.add({ months: 1 }).subtract({ days: 1 });
      case 'QUARTER':
        return firstDay.add({ months: 3 }).subtract({ days: 1 });
    }
  })();

  const dayCount = firstDay.until(lastDay, { largestUnit: 'days' }).days + 1;

  const days = Array.from({ length: dayCount }, (_, dayIndex) =>
    firstDay.add({ days: dayIndex }),
  );

  return { firstDay, lastDay, days };
};
