import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import { resolveRecordCalendarWeekEventDrop } from '@/object-record/record-calendar/week/utils/resolveRecordCalendarWeekEventDrop';

const gridRect = {
  height: RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight,
  left: 100,
  top: 200,
  width: 756,
};

describe('resolveRecordCalendarWeekEventDrop', () => {
  it('resolves a day and snaps the event start to 30 minutes', () => {
    expect(
      resolveRecordCalendarWeekEventDrop({
        dayCount: 7,
        grabOffsetY: 10,
        gridRect,
        pointerX:
          gridRect.left +
          RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth +
          2.5 * 100,
        pointerY:
          gridRect.top + 10 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight + 17,
      }),
    ).toEqual({
      dayIndex: 2,
      destinationMinutes: 10 * 60,
    });
  });

  it('resolves every valid horizontal position to the only visible day', () => {
    expect(
      resolveRecordCalendarWeekEventDrop({
        dayCount: 1,
        grabOffsetY: 0,
        gridRect,
        pointerX: gridRect.left + gridRect.width - 1,
        pointerY:
          gridRect.top + 14.25 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
      }),
    ).toEqual({ dayIndex: 0, destinationMinutes: 14 * 60 });
  });

  it.each([
    ['time gutter', gridRect.left + 20, gridRect.top + 100],
    ['left of grid', gridRect.left - 1, gridRect.top + 100],
    ['right of grid', gridRect.left + gridRect.width, gridRect.top + 100],
    [
      'above grid',
      gridRect.left + RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth + 10,
      gridRect.top - 1,
    ],
    [
      'below grid',
      gridRect.left + RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth + 10,
      gridRect.top + gridRect.height,
    ],
  ])('rejects a drop in the %s', (_label, pointerX, pointerY) => {
    expect(
      resolveRecordCalendarWeekEventDrop({
        dayCount: 7,
        grabOffsetY: 0,
        gridRect,
        pointerX,
        pointerY,
      }),
    ).toBeNull();
  });

  it('clamps the first event start to midnight', () => {
    expect(
      resolveRecordCalendarWeekEventDrop({
        dayCount: 7,
        grabOffsetY: 20,
        gridRect,
        pointerX:
          gridRect.left + RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth + 10,
        pointerY: gridRect.top + 1,
      }),
    ).toMatchObject({ destinationMinutes: 0 });
  });

  it('clamps the last event start to 23:30', () => {
    expect(
      resolveRecordCalendarWeekEventDrop({
        dayCount: 7,
        grabOffsetY: 0,
        gridRect,
        pointerX: gridRect.left + gridRect.width - 1,
        pointerY: gridRect.top + gridRect.height - 1,
      }),
    ).toEqual({ dayIndex: 6, destinationMinutes: 23.5 * 60 });
  });
});
