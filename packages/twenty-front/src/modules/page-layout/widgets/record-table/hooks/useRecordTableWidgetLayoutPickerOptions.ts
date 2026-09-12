import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isFieldMetadataItemAvailableAsCalendarField } from '@/object-record/record-calendar/utils/isFieldMetadataItemAvailableAsCalendarField';
import { getRecordTableWidgetLayoutPickerOptions } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { isFieldMetadataItemAvailableAsWidgetGroupByField } from '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetGroupByField';
import { isDefined } from 'twenty-shared/utils';

// Which layouts a record table widget over this object can offer, plus the
// fields a layout switch needs to seed. Both layout pickers ask this so they
// cannot disagree about what is on offer.
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
