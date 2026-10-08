import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isFieldMetadataItemAvailableAsCalendarField } from '@/object-record/record-calendar/utils/isFieldMetadataItemAvailableAsCalendarField';
import { getRecordTableWidgetLayoutPickerOptions } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { isFieldMetadataItemAvailableAsWidgetGroupByField } from '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetGroupByField';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableWidgetLayoutPickerOptions = (
  objectMetadataItem: EnrichedObjectMetadataItem | undefined,
) => {
  const readableFields = objectMetadataItem?.readableFields ?? [];

  const defaultGroupByFieldMetadataItem =
    readableFields.find(isFieldMetadataItemAvailableAsWidgetGroupByField) ??
    null;

  const defaultCalendarFieldMetadataItem =
    readableFields.find(isFieldMetadataItemAvailableAsCalendarField) ?? null;

  const layoutOptions = getRecordTableWidgetLayoutPickerOptions({
    isKanbanAvailable: isDefined(defaultGroupByFieldMetadataItem),
    isCalendarAvailable: isDefined(defaultCalendarFieldMetadataItem),
  });

  return {
    layoutOptions,
    defaultGroupByFieldMetadataItem,
    defaultCalendarFieldMetadataItem,
  };
};
