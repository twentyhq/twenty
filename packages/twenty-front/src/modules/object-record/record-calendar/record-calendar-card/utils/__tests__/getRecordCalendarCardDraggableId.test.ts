import {
  getRecordCalendarCardDraggableId,
  getRecordIdFromRecordCalendarCardDraggableId,
} from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardDraggableId';

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
    expect(
      getRecordIdFromRecordCalendarCardDraggableId(firstDayDraggableId),
    ).toBe('record-id');
    expect(
      getRecordIdFromRecordCalendarCardDraggableId(secondDayDraggableId),
    ).toBe('record-id');
  });

  it('preserves record ids containing separator characters', () => {
    const draggableId = getRecordCalendarCardDraggableId({
      calendarDay: '2026-07-08',
      recordId: 'record:id/with special characters',
    });

    expect(getRecordIdFromRecordCalendarCardDraggableId(draggableId)).toBe(
      'record:id/with special characters',
    );
  });

  it('accepts legacy draggable ids', () => {
    expect(
      getRecordIdFromRecordCalendarCardDraggableId('legacy-record-id'),
    ).toBe('legacy-record-id');
  });
});
