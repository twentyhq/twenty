export type RecordCalendarWeekActiveSlot = {
  day: string;
  interactionMode: RecordCalendarWeekSlotInteractionMode;
  slotIndex: number;
};

export type RecordCalendarWeekSlotInteractionMode = 'keyboard' | 'pointer';

type UpdateRecordCalendarWeekActiveSlotArgs = {
  currentActiveSlot: RecordCalendarWeekActiveSlot | null;
  day: string;
  interactionMode: RecordCalendarWeekSlotInteractionMode;
  slotIndex: number | null;
};

export const updateRecordCalendarWeekActiveSlot = ({
  currentActiveSlot,
  day,
  interactionMode,
  slotIndex,
}: UpdateRecordCalendarWeekActiveSlotArgs): RecordCalendarWeekActiveSlot | null => {
  if (slotIndex === null) {
    return currentActiveSlot?.day === day &&
      currentActiveSlot.interactionMode === interactionMode
      ? null
      : currentActiveSlot;
  }

  if (
    currentActiveSlot?.interactionMode === 'keyboard' &&
    interactionMode === 'pointer'
  ) {
    return currentActiveSlot;
  }

  if (
    currentActiveSlot?.day === day &&
    currentActiveSlot.interactionMode === interactionMode &&
    currentActiveSlot.slotIndex === slotIndex
  ) {
    return currentActiveSlot;
  }

  return { day, interactionMode, slotIndex };
};
