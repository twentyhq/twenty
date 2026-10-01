import { getRecordTimelineHeaderCells } from '@/object-record/record-timeline/utils/getRecordTimelineHeaderCells';
import { getRecordTimelineWindow } from '@/object-record/record-timeline/utils/getRecordTimelineWindow';
import { Temporal } from 'temporal-polyfill';

const MONDAY = 1;

describe('getRecordTimelineHeaderCells', () => {
  it('groups quarter days into one cell per month', () => {
    const { days } = getRecordTimelineWindow({
      anchorDate: Temporal.PlainDate.from('2026-11-15'),
      zoom: 'QUARTER',
      weekStartsOnDayIndex: MONDAY,
    });

    const cells = getRecordTimelineHeaderCells({ days, zoom: 'QUARTER' });

    expect(
      cells.map(({ firstDay, startDayIndex, daySpan }) => ({
        firstDay: firstDay.toString(),
        startDayIndex,
        daySpan,
      })),
    ).toEqual([
      { firstDay: '2026-10-01', startDayIndex: 0, daySpan: 31 },
      { firstDay: '2026-11-01', startDayIndex: 31, daySpan: 30 },
      { firstDay: '2026-12-01', startDayIndex: 61, daySpan: 31 },
    ]);
  });

  it('keeps one cell per day for month zoom', () => {
    const { days } = getRecordTimelineWindow({
      anchorDate: Temporal.PlainDate.from('2026-02-14'),
      zoom: 'MONTH',
      weekStartsOnDayIndex: MONDAY,
    });

    const cells = getRecordTimelineHeaderCells({ days, zoom: 'MONTH' });

    expect(cells).toHaveLength(28);
    expect(cells.every(({ daySpan }) => daySpan === 1)).toBe(true);
  });
});
