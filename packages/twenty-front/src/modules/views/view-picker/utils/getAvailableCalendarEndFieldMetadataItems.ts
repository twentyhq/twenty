import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

type CalendarFieldMetadataItem = Pick<FieldMetadataItem, 'id' | 'type'>;

export const getAvailableCalendarEndFieldMetadataItems = <
  T extends CalendarFieldMetadataItem,
>({
  availableFieldsForCalendar,
  calendarFieldMetadataId,
}: {
  availableFieldsForCalendar: T[];
  calendarFieldMetadataId: string | null | undefined;
}): T[] => {
  const calendarFieldMetadataItem = availableFieldsForCalendar.find(
    (fieldMetadataItem) => fieldMetadataItem.id === calendarFieldMetadataId,
  );

  if (calendarFieldMetadataItem === undefined) {
    return [];
  }

  return availableFieldsForCalendar.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.id !== calendarFieldMetadataItem.id &&
      fieldMetadataItem.type === calendarFieldMetadataItem.type,
  );
};
