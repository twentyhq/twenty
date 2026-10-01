import { type RecordTimelineZoom } from '@/object-record/record-timeline/types/RecordTimelineZoom';
import { type Temporal } from 'temporal-polyfill';

export type RecordTimelineHeaderCell = {
  firstDay: Temporal.PlainDate;
  lastDay: Temporal.PlainDate;
  startDayIndex: number;
  daySpan: number;
};

// Quarter days are too narrow for a label, so their header groups days by month.
export const getRecordTimelineHeaderCells = ({
  days,
  zoom,
}: {
  days: Temporal.PlainDate[];
  zoom: RecordTimelineZoom;
}): RecordTimelineHeaderCell[] =>
  days.reduce<RecordTimelineHeaderCell[]>((cells, day, dayIndex) => {
    const lastCell = cells.at(-1);

    if (zoom === 'QUARTER' && lastCell?.firstDay.month === day.month) {
      lastCell.lastDay = day;
      lastCell.daySpan += 1;

      return cells;
    }

    return [
      ...cells,
      { firstDay: day, lastDay: day, startDayIndex: dayIndex, daySpan: 1 },
    ];
  }, []);
