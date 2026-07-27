import { type View } from '@/views/types/View';

export const computeRecordTableWidgetViewLoadContentSignature = (
  view: View,
): string =>
  JSON.stringify({
    fields: [...view.viewFields]
      .sort((fieldA, fieldB) => fieldA.position - fieldB.position)
      .map((field) => ({
        id: field.id,
        fieldMetadataId: field.fieldMetadataId,
        isVisible: field.isVisible,
        position: field.position,
        aggregateOperation: field.aggregateOperation,
      })),
    filters: [...view.viewFilters]
      .sort((filterA, filterB) => filterA.id.localeCompare(filterB.id))
      .map((filter) => ({
        id: filter.id,
        fieldMetadataId: filter.fieldMetadataId,
        operand: filter.operand,
        value: filter.value,
        viewFilterGroupId: filter.viewFilterGroupId,
      })),
    filterGroups: (view.viewFilterGroups ?? []).map((group) => ({
      id: group.id,
      logicalOperator: group.logicalOperator,
      parentViewFilterGroupId: group.parentViewFilterGroupId,
    })),
    sorts: view.viewSorts.map((sort) => ({
      id: sort.id,
      fieldMetadataId: sort.fieldMetadataId,
      direction: sort.direction,
    })),
    layout: {
      type: view.type,
      mainGroupByFieldMetadataId: view.mainGroupByFieldMetadataId,
      shouldHideEmptyGroups: view.shouldHideEmptyGroups,
      kanbanAggregateOperation: view.kanbanAggregateOperation,
      kanbanAggregateOperationFieldMetadataId:
        view.kanbanAggregateOperationFieldMetadataId,
      calendarLayout: view.calendarLayout,
      calendarFieldMetadataId: view.calendarFieldMetadataId,
      calendarEndFieldMetadataId: view.calendarEndFieldMetadataId,
    },
    groups: [...(view.viewGroups ?? [])]
      .sort((groupA, groupB) => groupA.position - groupB.position)
      .map((group) => ({
        id: group.id,
        fieldValue: group.fieldValue,
        isVisible: group.isVisible,
        position: group.position,
      })),
  });
