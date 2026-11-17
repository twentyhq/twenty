import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { getRecordTableWidgetLayoutDefaultFields } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutDefaultFields';
import { isDefined } from 'twenty-shared/utils';
import { ViewType } from '~/generated-metadata/graphql';

export const isRecordTableWidgetLayoutAvailable = ({
  viewType,
  objectMetadataItem,
}: {
  viewType: RecordTableWidgetLayoutViewType;
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { defaultGroupByFieldMetadataItem, defaultCalendarFieldMetadataItem } =
    getRecordTableWidgetLayoutDefaultFields(objectMetadataItem);

  if (viewType === ViewType.KANBAN_WIDGET) {
    return isDefined(defaultGroupByFieldMetadataItem);
  }

  if (viewType === ViewType.CALENDAR_WIDGET) {
    return isDefined(defaultCalendarFieldMetadataItem);
  }

  return true;
};
