import { getRecordCalendarCardDraggableId } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardDraggableId';

describe('getRecordCalendarCardDraggableId', () => {
  it('creates a different draggable id for each rendered day', () => {
    const firstDayDraggableId = getRecordCalendarCardDraggableId({
      calendarDay: '2026-07-08',
      recordId: 'record-id',
    });
    const secondDayDraggableId = getRecordCalendarCardDraggableId({
      calendarDay: '2026-07-09',
      recordId: 'record-id',
    });

    expect(firstDayDraggableId).not.toBe(secondDayDraggableId);
  });
});
