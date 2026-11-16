import { type RelatedRecordsWidgetSource } from '@/page-layout/widgets/field/types/RelatedRecordsWidgetSource';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { isDefined } from 'twenty-shared/utils';
import { ViewType } from '~/generated-metadata/graphql';

export const isRelatedRecordsWidgetSourceAvailableForLayout = ({
  relatedRecordsWidgetSource,
  layoutViewType,
}: {
  relatedRecordsWidgetSource: Pick<
    RelatedRecordsWidgetSource,
    'defaultGroupByFieldMetadataItem' | 'defaultCalendarFieldMetadataItem'
  >;
  layoutViewType: RecordTableWidgetLayoutViewType;
}) => {
  if (layoutViewType === ViewType.KANBAN_WIDGET) {
    return isDefined(
      relatedRecordsWidgetSource.defaultGroupByFieldMetadataItem,
    );
  }

  if (layoutViewType === ViewType.CALENDAR_WIDGET) {
    return isDefined(
      relatedRecordsWidgetSource.defaultCalendarFieldMetadataItem,
    );
  }

  return true;
};
