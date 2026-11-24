import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRecordTableWidgetLayoutDefaultFields } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutDefaultFields';
import { getRecordTableWidgetLayoutPickerOptions } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableWidgetLayoutPickerOptions = (
  objectMetadataItem: EnrichedObjectMetadataItem | undefined,
) => {
  const { defaultGroupByFieldMetadataItem, defaultCalendarFieldMetadataItem } =
    getRecordTableWidgetLayoutDefaultFields(objectMetadataItem);

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
