import { type FlatView } from '@/metadata-store/types/FlatView';
import { type UpsertViewWidgetViewSettingsInput } from '~/generated-metadata/graphql';

export const buildUpsertViewWidgetViewSettingsInput = (
  view: FlatView,
): UpsertViewWidgetViewSettingsInput => ({
  type: view.type,
  mainGroupByFieldMetadataId: view.mainGroupByFieldMetadataId ?? null,
  shouldHideEmptyGroups: view.shouldHideEmptyGroups,
  openRecordIn: view.openRecordIn,
  kanbanAggregateOperation: view.kanbanAggregateOperation ?? null,
  kanbanAggregateOperationFieldMetadataId:
    view.kanbanAggregateOperationFieldMetadataId ?? null,
  kanbanColumnWidth: view.kanbanColumnWidth ?? null,
  calendarLayout: view.calendarLayout ?? null,
  calendarFieldMetadataId: view.calendarFieldMetadataId ?? null,
  calendarEndFieldMetadataId: view.calendarEndFieldMetadataId ?? null,
});
