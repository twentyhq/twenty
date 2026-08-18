import type { AxiosInstance } from "axios";
import { findViews } from "src/logic-functions/requests/find-views.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";

export const migrateViews = async (
  targetWorkspace: AxiosInstance,
  sourceViews: Awaited<ReturnType<typeof findViews>>,
  targetViews: Awaited<ReturnType<typeof findViews>>,
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
) => {
  const existingTargetViewIds = new Set(targetViews.map((view) => view.id));
  const existingTargetViewFieldIds = new Set(targetViews.flatMap((view) => view.viewFields.map((f) => f.id)));
  const existingTargetViewFilterIds = new Set(targetViews.flatMap((view) => view.viewFilters.map((f) => f.id)));
  const existingTargetViewSortIds = new Set(targetViews.flatMap((view) => view.viewSorts.map((f) => f.id)));
  const existingTargetViewGroupIds = new Set(targetViews.flatMap((view) => view.viewGroups.map((f) => f.id)));
  const existingTargetViewFilterGroupIds = new Set(targetViews.flatMap((view) => view.viewFilterGroups.map((f) => f.id)));
  const existingTargetViewFieldGroupIds = new Set(targetViews.flatMap((view) => view.viewFieldGroups.map((f) => f.id)));

  const resolveFieldId = (sourceFieldId: string | null): string | null =>
    sourceFieldId === null ? null : targetFieldIdBySourceFieldId.get(sourceFieldId) ?? null;

  let createdViews = 0;
  let createdSubEntities = 0;

  for (const view of sourceViews) {
    const targetObjectMetadataId = targetObjectIdBySourceObjectId.get(view.objectMetadataId);
    if (targetObjectMetadataId === undefined) {
      console.warn(`Skipping view "${view.name}": target object not found for object ${view.objectMetadataId}`);
      continue;
    }

    if (!existingTargetViewIds.has(view.id)) {
      await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createView', 'input', 'CreateViewInput', {
        id: view.id,
        name: view.name,
        objectMetadataId: targetObjectMetadataId,
        type: view.type,
        key: view.key,
        icon: view.icon,
        position: view.position,
        isCompact: view.isCompact,
        shouldHideEmptyGroups: view.shouldHideEmptyGroups,
        kanbanColumnWidth: view.kanbanColumnWidth,
        kanbanAggregateOperation: view.kanbanAggregateOperation,
        kanbanAggregateOperationFieldMetadataId: resolveFieldId(view.kanbanAggregateOperationFieldMetadataId),
        anyFieldFilterValue: view.anyFieldFilterValue,
        calendarLayout: view.calendarLayout,
        calendarFieldMetadataId: resolveFieldId(view.calendarFieldMetadataId),
        calendarEndFieldMetadataId: resolveFieldId(view.calendarEndFieldMetadataId),
        mainGroupByFieldMetadataId: resolveFieldId(view.mainGroupByFieldMetadataId),
      }));
      createdViews += 1;
    }

    for (const viewFieldGroup of view.viewFieldGroups) {
      if (existingTargetViewFieldGroupIds.has(viewFieldGroup.id)) {
        continue;
      }
      await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createViewFieldGroup', 'input', 'CreateViewFieldGroupInput', {
        id: viewFieldGroup.id,
        name: viewFieldGroup.name,
        viewId: viewFieldGroup.viewId,
        position: viewFieldGroup.position,
        isVisible: viewFieldGroup.isVisible,
      }));
      createdSubEntities += 1;
    }

    for (const viewField of view.viewFields) {
      if (existingTargetViewFieldIds.has(viewField.id)) {
        continue;
      }
      const targetFieldMetadataId = resolveFieldId(viewField.fieldMetadataId);
      if (targetFieldMetadataId === null) {
        console.warn(`Skipping view field "${viewField.id}" on view "${view.name}": target field not found for field ${viewField.fieldMetadataId}`);
        continue;
      }
      await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createViewField', 'input', 'CreateViewFieldInput', {
        id: viewField.id,
        fieldMetadataId: targetFieldMetadataId,
        viewId: viewField.viewId,
        isVisible: viewField.isVisible,
        size: viewField.size,
        position: viewField.position,
        aggregateOperation: viewField.aggregateOperation,
        viewFieldGroupId: viewField.viewFieldGroupId,
      }));
      createdSubEntities += 1;
    }

    // ViewFilterGroups can nest under a parent, so a group is only created once its parent
    // (if any) is already resolved - same dependency ordering NavigationMenuItem folders need.
    const remainingFilterGroups = [...view.viewFilterGroups];
    const resolvedFilterGroupIds = new Set(existingTargetViewFilterGroupIds);
    while (remainingFilterGroups.length > 0) {
      const creatableNow = remainingFilterGroups.filter(
        (group) => group.parentViewFilterGroupId === null || resolvedFilterGroupIds.has(group.parentViewFilterGroupId),
      );
      if (creatableNow.length === 0) {
        console.warn(`Skipping ${remainingFilterGroups.length} view filter group(s) on view "${view.name}": unresolved parent chain`);
        break;
      }
      for (const group of creatableNow) {
        remainingFilterGroups.splice(remainingFilterGroups.indexOf(group), 1);
        if (!resolvedFilterGroupIds.has(group.id)) {
          await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createViewFilterGroup', 'input', 'CreateViewFilterGroupInput', {
            id: group.id,
            parentViewFilterGroupId: group.parentViewFilterGroupId,
            logicalOperator: group.logicalOperator,
            positionInViewFilterGroup: group.positionInViewFilterGroup,
            viewId: group.viewId,
          }));
          createdSubEntities += 1;
        }
        resolvedFilterGroupIds.add(group.id);
      }
    }

    for (const viewFilter of view.viewFilters) {
      if (existingTargetViewFilterIds.has(viewFilter.id)) {
        continue;
      }
      const targetFieldMetadataId = resolveFieldId(viewFilter.fieldMetadataId);
      if (targetFieldMetadataId === null) {
        console.warn(`Skipping view filter "${viewFilter.id}" on view "${view.name}": target field not found for field ${viewFilter.fieldMetadataId}`);
        continue;
      }
      await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createViewFilter', 'input', 'CreateViewFilterInput', {
        id: viewFilter.id,
        fieldMetadataId: targetFieldMetadataId,
        operand: viewFilter.operand,
        value: viewFilter.value,
        viewFilterGroupId: viewFilter.viewFilterGroupId,
        positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
        subFieldName: viewFilter.subFieldName,
        relationTargetFieldMetadataId: resolveFieldId(viewFilter.relationTargetFieldMetadataId),
        viewId: viewFilter.viewId,
      }));
      createdSubEntities += 1;
    }

    for (const viewSort of view.viewSorts) {
      if (existingTargetViewSortIds.has(viewSort.id)) {
        continue;
      }
      const targetFieldMetadataId = resolveFieldId(viewSort.fieldMetadataId);
      if (targetFieldMetadataId === null) {
        console.warn(`Skipping view sort "${viewSort.id}" on view "${view.name}": target field not found for field ${viewSort.fieldMetadataId}`);
        continue;
      }
      await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createViewSort', 'input', 'CreateViewSortInput', {
        id: viewSort.id,
        fieldMetadataId: targetFieldMetadataId,
        direction: viewSort.direction,
        subFieldName: viewSort.subFieldName,
        viewId: viewSort.viewId,
      }));
      createdSubEntities += 1;
    }

    for (const viewGroup of view.viewGroups) {
      if (existingTargetViewGroupIds.has(viewGroup.id)) {
        continue;
      }
      await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createViewGroup', 'input', 'CreateViewGroupInput', {
        id: viewGroup.id,
        isVisible: viewGroup.isVisible,
        fieldValue: viewGroup.fieldValue,
        position: viewGroup.position,
        viewId: viewGroup.viewId,
      }));
      createdSubEntities += 1;
    }
  }

  console.log(`Views: created ${createdViews} view(s) and ${createdSubEntities} related entitie(s)`);
};