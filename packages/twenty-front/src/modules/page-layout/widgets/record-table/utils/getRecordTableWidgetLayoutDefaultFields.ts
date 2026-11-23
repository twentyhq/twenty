import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isFieldMetadataItemAvailableAsCalendarField } from '@/object-record/record-calendar/utils/isFieldMetadataItemAvailableAsCalendarField';
import { isFieldMetadataItemAvailableAsWidgetGroupByField } from '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetGroupByField';

export const getRecordTableWidgetLayoutDefaultFields = (
  objectMetadataItem:
    | Pick<EnrichedObjectMetadataItem, 'readableFields'>
    | undefined,
) => {
  const readableFields = objectMetadataItem?.readableFields ?? [];

  return {
    defaultGroupByFieldMetadataItem:
      readableFields.find(isFieldMetadataItemAvailableAsWidgetGroupByField) ??
      null,
    defaultCalendarFieldMetadataItem:
      readableFields.find(isFieldMetadataItemAvailableAsCalendarField) ?? null,
  };
};
