import { type RelatedRecordsWidgetSource } from '@/page-layout/widgets/field/types/RelatedRecordsWidgetSource';
import { isRelatedRecordsWidgetSourceAvailableForLayout } from '@/page-layout/widgets/field/utils/isRelatedRecordsWidgetSourceAvailableForLayout';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import {
  getRecordTableWidgetLayoutPickerOptions,
  type RecordTableWidgetLayoutPickerOption,
} from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { ViewType } from '~/generated-metadata/graphql';

type LayoutAvailabilitySource = Pick<
  RelatedRecordsWidgetSource,
  'defaultGroupByFieldMetadataItem' | 'defaultCalendarFieldMetadataItem'
>;

export const getRelatedRecordsWidgetLayoutOptions = (
  relatedRecordsWidgetSources: LayoutAvailabilitySource[],
): RecordTableWidgetLayoutPickerOption[] => {
  if (!isNonEmptyArray(relatedRecordsWidgetSources)) {
    return [];
  }

  const hasSourceAvailableForLayout = (
    layoutViewType: RecordTableWidgetLayoutViewType,
  ) =>
    relatedRecordsWidgetSources.some((relatedRecordsWidgetSource) =>
      isRelatedRecordsWidgetSourceAvailableForLayout({
        relatedRecordsWidgetSource,
        layoutViewType,
      }),
    );

  return getRecordTableWidgetLayoutPickerOptions({
    isKanbanAvailable: hasSourceAvailableForLayout(ViewType.KANBAN_WIDGET),
    isCalendarAvailable: hasSourceAvailableForLayout(ViewType.CALENDAR_WIDGET),
  });
};
