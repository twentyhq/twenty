import { updateRecordCalendarWeekActiveSlot } from '@/object-record/record-calendar/week/utils/updateRecordCalendarWeekActiveSlot';

describe('updateRecordCalendarWeekActiveSlot', () => {
  it('replaces the active slot when another day becomes active', () => {
    expect(
      updateRecordCalendarWeekActiveSlot({
        currentActiveSlot: {
          day: '2026-07-13',
          interactionMode: 'pointer',
          slotIndex: 18,
        },
        day: '2026-07-14',
        interactionMode: 'pointer',
        slotIndex: 20,
      }),
    ).toEqual({
      day: '2026-07-14',
      interactionMode: 'pointer',
      slotIndex: 20,
    });
  });

  it('clears the active day', () => {
    expect(
      updateRecordCalendarWeekActiveSlot({
        currentActiveSlot: {
          day: '2026-07-13',
          interactionMode: 'pointer',
          slotIndex: 18,
        },
        day: '2026-07-13',
        interactionMode: 'pointer',
        slotIndex: null,
      }),
    ).toBeNull();
  });

  it('does not clear another active day', () => {
    const currentActiveSlot = {
      day: '2026-07-14',
      interactionMode: 'pointer' as const,
      slotIndex: 20,
    };

    expect(
      updateRecordCalendarWeekActiveSlot({
        currentActiveSlot,
        day: '2026-07-13',
        interactionMode: 'pointer',
        slotIndex: null,
      }),
    ).toBe(currentActiveSlot);
  });

  it('preserves the active slot reference when the pointer stays in one slot', () => {
    const currentActiveSlot = {
      day: '2026-07-13',
      interactionMode: 'pointer' as const,
      slotIndex: 18,
    };

    expect(
      updateRecordCalendarWeekActiveSlot({
        currentActiveSlot,
        day: '2026-07-13',
        interactionMode: 'pointer',
        slotIndex: 18,
      }),
    ).toBe(currentActiveSlot);
  });

  it('keeps a keyboard slot active while the pointer moves', () => {
    const currentActiveSlot = {
      day: '2026-07-13',
      interactionMode: 'keyboard' as const,
      slotIndex: 18,
    };

    expect(
      updateRecordCalendarWeekActiveSlot({
        currentActiveSlot,
        day: '2026-07-14',
        interactionMode: 'pointer',
        slotIndex: 20,
      }),
    ).toBe(currentActiveSlot);
  });

  it('does not clear a keyboard slot on pointer leave', () => {
    const currentActiveSlot = {
      day: '2026-07-13',
      interactionMode: 'keyboard' as const,
      slotIndex: 18,
    };

    expect(
      updateRecordCalendarWeekActiveSlot({
        currentActiveSlot,
        day: '2026-07-13',
        interactionMode: 'pointer',
        slotIndex: null,
      }),
    ).toBe(currentActiveSlot);
  });
});
