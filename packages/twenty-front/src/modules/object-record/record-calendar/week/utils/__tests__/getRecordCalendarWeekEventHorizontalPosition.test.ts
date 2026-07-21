import { getRecordCalendarWeekEventHorizontalPosition } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekEventHorizontalPosition';

describe('getRecordCalendarWeekEventHorizontalPosition', () => {
  it('uses the available width for a non-overlapping event', () => {
    expect(
      getRecordCalendarWeekEventHorizontalPosition({
        columnCount: 1,
        columnIndex: 0,
      }),
    ).toEqual({
      hoverStackingOrder: 2,
      left: 'calc(0% + 4px)',
      stackingOrder: 1,
      width: 'calc(100% - 8px)',
    });
  });

  it('cascades overlapping events from their column to the right edge', () => {
    expect(
      Array.from({ length: 5 }, (_, columnIndex) =>
        getRecordCalendarWeekEventHorizontalPosition({
          columnCount: 5,
          columnIndex,
        }),
      ),
    ).toEqual([
      {
        hoverStackingOrder: 6,
        left: 'calc(0% + 4px)',
        stackingOrder: 1,
        width: 'calc(100% - 8px)',
      },
      {
        hoverStackingOrder: 6,
        left: 'calc(20% + 2.8px)',
        stackingOrder: 2,
        width: 'calc(80% - 6.8px)',
      },
      {
        hoverStackingOrder: 6,
        left: 'calc(40% + 1.6px)',
        stackingOrder: 3,
        width: 'calc(60% - 5.6px)',
      },
      {
        hoverStackingOrder: 6,
        left: 'calc(60% + 0.4px)',
        stackingOrder: 4,
        width: 'calc(40% - 4.4px)',
      },
      {
        hoverStackingOrder: 6,
        left: 'calc(80% - 0.8px)',
        stackingOrder: 5,
        width: 'calc(20% - 3.2px)',
      },
    ]);
  });
});
