type GetEffectiveRecordCalendarEndFieldMetadataIdArgs = {
  calendarEndFieldMetadataId: string | null | undefined;
  isCalendarWeekViewEnabled: boolean;
};

export const getEffectiveRecordCalendarEndFieldMetadataId = ({
  calendarEndFieldMetadataId,
  isCalendarWeekViewEnabled,
}: GetEffectiveRecordCalendarEndFieldMetadataIdArgs) =>
  isCalendarWeekViewEnabled ? (calendarEndFieldMetadataId ?? null) : null;
