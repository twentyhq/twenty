import { type GraphQLView } from '@/views/types/GraphQLView';
import { isDefined } from 'twenty-shared/utils';
import { type UpdateViewInput } from '~/generated-metadata/graphql';

export const convertUpdateViewInputToGql = (
  view: Partial<GraphQLView & { __typename?: string }>,
): UpdateViewInput => {
  return {
    id: view.id,
    ...(view.name && { name: view.name }),
    ...(view.icon && { icon: view.icon }),
    ...(isDefined(view.position) && { position: view.position }),
    ...(isDefined(view.isCompact) && { isCompact: view.isCompact }),
    ...(isDefined(view.kanbanAggregateOperation) && {
      kanbanAggregateOperation: view.kanbanAggregateOperation,
    }),
    ...(isDefined(view.kanbanAggregateOperationFieldMetadataId) && {
      kanbanAggregateOperationFieldMetadataId:
        view.kanbanAggregateOperationFieldMetadataId,
    }),
    ...(isDefined(view.anyFieldFilterValue) && {
      anyFieldFilterValue: view.anyFieldFilterValue,
    }),
    ...(isDefined(view.key) && { key: view.key }),
    ...(isDefined(view.openRecordIn) && {
      openRecordIn: view.openRecordIn,
    }),
    ...(isDefined(view.type) && { type: view.type }),
    ...(isDefined(view.calendarLayout) && {
      calendarLayout: view.calendarLayout,
    }),
    ...(isDefined(view.calendarFieldMetadataId) && {
      calendarFieldMetadataId: view.calendarFieldMetadataId,
    }),
    ...(isDefined(view.visibility) && { visibility: view.visibility }),
    ...(isDefined(view.shouldHideEmptyGroups) && {
      shouldHideEmptyGroups: view.shouldHideEmptyGroups,
    }),
    ...(view.mainGroupByFieldMetadataId !== undefined && {
      mainGroupByFieldMetadataId: view.mainGroupByFieldMetadataId,
    }),
    ...(view.roadmapFieldStartId !== undefined && {
      roadmapFieldStartId: view.roadmapFieldStartId,
    }),
    ...(view.roadmapFieldEndId !== undefined && {
      roadmapFieldEndId: view.roadmapFieldEndId,
    }),
    ...(view.roadmapFieldGroupId !== undefined && {
      roadmapFieldGroupId: view.roadmapFieldGroupId,
    }),
    ...(view.roadmapFieldColorId !== undefined && {
      roadmapFieldColorId: view.roadmapFieldColorId,
    }),
    ...(view.roadmapFieldLabelId !== undefined && {
      roadmapFieldLabelId: view.roadmapFieldLabelId,
    }),
    ...(view.roadmapFieldPlannedStartId !== undefined && {
      roadmapFieldPlannedStartId: view.roadmapFieldPlannedStartId,
    }),
    ...(view.roadmapFieldPlannedEndId !== undefined && {
      roadmapFieldPlannedEndId: view.roadmapFieldPlannedEndId,
    }),
    ...(view.roadmapFieldStatusId !== undefined && {
      roadmapFieldStatusId: view.roadmapFieldStatusId,
    }),
    ...(view.roadmapFieldBlockedById !== undefined && {
      roadmapFieldBlockedById: view.roadmapFieldBlockedById,
    }),
    ...(isDefined(view.roadmapDefaultZoom) && {
      roadmapDefaultZoom: view.roadmapDefaultZoom,
    }),
    ...(isDefined(view.roadmapShowToday) && {
      roadmapShowToday: view.roadmapShowToday,
    }),
    ...(isDefined(view.roadmapShowWeekends) && {
      roadmapShowWeekends: view.roadmapShowWeekends,
    }),
    ...(isDefined(view.roadmapShowDeviation) && {
      roadmapShowDeviation: view.roadmapShowDeviation,
    }),
  };
};
