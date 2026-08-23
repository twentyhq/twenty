import type { AxiosInstance } from "axios";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity, createManyMetadataEntities } from "src/logic-functions/requests/create-metadata-entity.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { View } from "src/logic-functions/types/view-entities.type";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";
import { createParentChainQueue } from "src/logic-functions/utils/parent-chain-queue.util";
import { countViewRequests, decrementEstimate } from "src/logic-functions/utils/estimate-migration-duration.util";

export const migrateViews = async (
  targetWorkspace: AxiosInstance,
  sourceViews: View[],
  targetViews: View[],
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
  targetViewIdBySourceViewId: Map<string, string>,
) => {
  const existingTargetViewIds = new Set(targetViews.map((view) => view.id));
  const existingTargetViewFilterIds = new Set(targetViews.flatMap((view) => view.viewFilters.map((f) => f.id)));
  const existingTargetViewGroupIds = new Set(targetViews.flatMap((view) => view.viewGroups.map((f) => f.id)));
  const existingTargetViewFilterGroupIds = new Set(targetViews.flatMap((view) => view.viewFilterGroups.map((f) => f.id)));
  const existingTargetViewFieldGroupIds = new Set(targetViews.flatMap((view) => view.viewFieldGroups.map((f) => f.id)));

  const existingTargetViewFieldKeys = new Set(
    targetViews.flatMap((view) => view.viewFields.map((f) => `${view.id}::${f.fieldMetadataId}`)),
  );
  const existingTargetViewSortKeys = new Set(
    targetViews.flatMap((view) => view.viewSorts.map((f) => `${view.id}::${f.fieldMetadataId}`)),
  );

  const targetIndexViewIdByObjectMetadataId = new Map(
    targetViews.filter((view) => view.key === 'INDEX').map((view) => [view.objectMetadataId, view.id]),
  );

  const resolveFieldId = (sourceFieldId: string | null): string | null =>
    sourceFieldId === null ? null : targetFieldIdBySourceFieldId.get(sourceFieldId) ?? null;

  let createdViews = 0;
  let createdSubEntities = 0;

  for (const view of sourceViews) {
    const isIndexView = view.key === 'INDEX';
    const targetObjectMetadataId = targetObjectIdBySourceObjectId.get(view.objectMetadataId);
    if (targetObjectMetadataId === undefined) {
      logger.warn(`Skipping view "${view.name}": target object not found for object ${view.objectMetadataId}`);
      // Still charged in the estimate, so release it rather than leaving a permanent residual.
      if (!isIndexView) {
        decrementEstimate({ otherRecordCount: countViewRequests([view]) });
      }
      continue;
    }

    let effectiveViewId: string;

    if (isIndexView) {
      const targetIndexViewId = targetIndexViewIdByObjectMetadataId.get(targetObjectMetadataId);
      if (targetIndexViewId === undefined) {
        logger.warn(`Skipping default view customization for "${view.name}": target object has no INDEX view`);
        continue;
      }
      effectiveViewId = targetIndexViewId;
    } else {
      effectiveViewId = view.id;
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
    }

    // An INDEX view keeps the target's own id, a migrated one keeps the source id - either way
    // this is the only place that knows the pairing, so anything referencing a view later
    // (navigation menu items, widget configurations) resolves through it.
    targetViewIdBySourceViewId.set(view.id, effectiveViewId);

    // createManyViewFieldGroups/createManyViewFields/createManyViewGroups exist as bulk
    // mutations server-side (unlike view/viewFilter/viewFilterGroup, which only have a
    // single-create one) - batching each of these into one request per view instead of one
    // request per row is a straight win with no ordering constraints to preserve, since none
    // of these three reference each other within the batch the way filter groups do.
    const viewFieldGroupsToCreate = view.viewFieldGroups.filter((viewFieldGroup) => existingTargetViewFieldGroupIds.has(viewFieldGroup.id) === false);
    if (viewFieldGroupsToCreate.length > 0) {
      await executeWithRetryAndCheckpoint(() => createManyMetadataEntities(targetWorkspace, 'createManyViewFieldGroups', 'inputs', 'CreateViewFieldGroupInput', viewFieldGroupsToCreate.map((viewFieldGroup) => ({
        id: viewFieldGroup.id,
        name: viewFieldGroup.name,
        viewId: effectiveViewId,
        position: viewFieldGroup.position,
        isVisible: viewFieldGroup.isVisible,
      }))));
      createdSubEntities += viewFieldGroupsToCreate.length;
    }

    const viewFieldsToCreate = view.viewFields.flatMap((viewField) => {
      const targetFieldMetadataId = resolveFieldId(viewField.fieldMetadataId);
      if (targetFieldMetadataId === null) {
        logger.warn(`Skipping view field "${viewField.id}" on view "${view.name}": target field not found for field ${viewField.fieldMetadataId}`);
        return [];
      }
      const viewFieldKey = `${effectiveViewId}::${targetFieldMetadataId}`;
      if (existingTargetViewFieldKeys.has(viewFieldKey)) {
        return [];
      }
      existingTargetViewFieldKeys.add(viewFieldKey);
      return [{
        id: viewField.id,
        fieldMetadataId: targetFieldMetadataId,
        viewId: effectiveViewId,
        isVisible: viewField.isVisible,
        size: viewField.size,
        position: viewField.position,
        aggregateOperation: viewField.aggregateOperation,
        viewFieldGroupId: viewField.viewFieldGroupId,
      }];
    });
    if (viewFieldsToCreate.length > 0) {
      await executeWithRetryAndCheckpoint(() => createManyMetadataEntities(targetWorkspace, 'createManyViewFields', 'inputs', 'CreateViewFieldInput', viewFieldsToCreate));
      createdSubEntities += viewFieldsToCreate.length;
    }

    const filterGroupQueue = createParentChainQueue(
      view.viewFilterGroups,
      (group) => group.id,
      (group) => group.parentViewFilterGroupId,
      existingTargetViewFilterGroupIds,
    );
    const resolvedFilterGroupIds = new Set(existingTargetViewFilterGroupIds);
    let processedFilterGroupCount = 0;
    while (filterGroupQueue.hasPending()) {
      for (const group of filterGroupQueue.drainWave()) {
        processedFilterGroupCount += 1;
        if (!resolvedFilterGroupIds.has(group.id)) {
          await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createViewFilterGroup', 'input', 'CreateViewFilterGroupInput', {
            id: group.id,
            parentViewFilterGroupId: group.parentViewFilterGroupId,
            logicalOperator: group.logicalOperator,
            positionInViewFilterGroup: group.positionInViewFilterGroup,
            viewId: effectiveViewId,
          }));
          createdSubEntities += 1;
        }
        resolvedFilterGroupIds.add(group.id);
        filterGroupQueue.enqueueChildrenOf(group);
      }
    }
    if (processedFilterGroupCount < view.viewFilterGroups.length) {
      logger.warn(`Skipping ${view.viewFilterGroups.length - processedFilterGroupCount} view filter group(s) on view "${view.name}": unresolved parent chain`);
    }

    for (const viewFilter of view.viewFilters) {
      if (existingTargetViewFilterIds.has(viewFilter.id)) {
        continue;
      }
      const targetFieldMetadataId = resolveFieldId(viewFilter.fieldMetadataId);
      if (targetFieldMetadataId === null) {
        logger.warn(`Skipping view filter "${viewFilter.id}" on view "${view.name}": target field not found for field ${viewFilter.fieldMetadataId}`);
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
        viewId: effectiveViewId,
      }));
      createdSubEntities += 1;
    }

    for (const viewSort of view.viewSorts) {
      const targetFieldMetadataId = resolveFieldId(viewSort.fieldMetadataId);
      if (targetFieldMetadataId === null) {
        logger.warn(`Skipping view sort "${viewSort.id}" on view "${view.name}": target field not found for field ${viewSort.fieldMetadataId}`);
        continue;
      }
      const viewSortKey = `${effectiveViewId}::${targetFieldMetadataId}`;
      if (existingTargetViewSortKeys.has(viewSortKey)) {
        continue;
      }
      await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createViewSort', 'input', 'CreateViewSortInput', {
        id: viewSort.id,
        fieldMetadataId: targetFieldMetadataId,
        direction: viewSort.direction,
        subFieldName: viewSort.subFieldName,
        viewId: effectiveViewId,
      }));
      existingTargetViewSortKeys.add(viewSortKey);
      createdSubEntities += 1;
    }

    // An INDEX view has no viewGroups to migrate and was never charged in the estimate, but it
    // still issued requests above - so it must not skip the budget check below.
    if (!isIndexView) {
      const viewGroupsToCreate = view.viewGroups.filter((viewGroup) => !existingTargetViewGroupIds.has(viewGroup.id));
      if (viewGroupsToCreate.length > 0) {
        await executeWithRetryAndCheckpoint(() => createManyMetadataEntities(targetWorkspace, 'createManyViewGroups', 'inputs', 'CreateViewGroupInput', viewGroupsToCreate.map((viewGroup) => ({
          id: viewGroup.id,
          isVisible: viewGroup.isVisible,
          fieldValue: viewGroup.fieldValue,
          position: viewGroup.position,
          viewId: effectiveViewId,
        }))));
        createdSubEntities += viewGroupsToCreate.length;
      }
      decrementEstimate({ otherRecordCount: countViewRequests([view]) });
    }

    if (await stopIfTimeBudgetExceeded()) {
      return false;
    }
  }

  logger.log(`Views: created ${createdViews} view(s) and ${createdSubEntities} related entitie(s)`);
  return true;
};