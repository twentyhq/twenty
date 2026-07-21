import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import { getRecordCalendarWeekSlotIndex } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekSlotIndex';

const columnTop = 100;
const columnHeight = RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight;

describe('getRecordCalendarWeekSlotIndex', () => {
  it.each([
    [columnTop, 0],
    [columnTop + 23.9, 0],
    [columnTop + 24, 1],
    [columnTop + columnHeight - 0.1, 47],
  ])('maps pointer position %s to slot %s', (pointerY, expectedSlot) => {
    expect(
      getRecordCalendarWeekSlotIndex({
        columnHeight,
        columnTop,
        pointerY,
      }),
    ).toBe(expectedSlot);
  });

  it.each([columnTop - 0.1, columnTop + columnHeight])(
    'returns null outside the day column at %s',
    (pointerY) => {
      expect(
        getRecordCalendarWeekSlotIndex({
          columnHeight,
          columnTop,
          pointerY,
        }),
      ).toBeNull();
    },
  );
});
