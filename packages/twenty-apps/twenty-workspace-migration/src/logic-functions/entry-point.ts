import { defineLogicFunction } from 'twenty-sdk/define';
import axios, { type AxiosInstance } from "axios";
import { findInstalledApplications } from "src/logic-functions/data/targetWorkspace/find-installed-applications.util";
import { FindAllObjectsAndFields } from "src/logic-functions/data/targetWorkspace/find-all-objects-and-fields.util";
import { createOneObject } from "src/logic-functions/data/targetWorkspace/create-one-object.util";
import { updateOneObject } from "src/logic-functions/data/targetWorkspace/update-one-object.util";
import { createOneField } from "src/logic-functions/data/targetWorkspace/create-one-field.util";
import { updateOneField } from "src/logic-functions/data/targetWorkspace/update-one-field.util";
import { findManyRecords } from "src/logic-functions/data/targetWorkspace/find-many-records.util";
import { createManyRecords } from "src/logic-functions/data/targetWorkspace/create-many-records.util";
import {
  FieldRelationInfo,
  FieldsListType,
  ObjectType,
  RelationType
} from "src/logic-functions/types/find-objects-fields.type";
import { UpdateOneObjectType } from "src/logic-functions/types/update-one-object.type";
import { CreateOneFieldType, RelationCreationPayload } from "src/logic-functions/types/create-one-field.type";
import { UpdateOneFieldType } from "src/logic-functions/types/update-one-field.type";
import { FieldMetadataType } from "src/logic-functions/types/field-metadata-type.enum";
import { buildRecordFieldPlan } from "src/logic-functions/utils/build-record-field-plan.util";
import { sortObjectsByDependency } from "src/logic-functions/utils/sort-objects-by-dependency.util";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { FindWorkspaceMembers } from "src/logic-functions/data/targetWorkspace/find-workspace-members.util";
import { findViews } from "src/logic-functions/data/targetWorkspace/find-views.util";
import { findNavigationMenuItems } from "src/logic-functions/data/targetWorkspace/find-navigation-menu-items.util";
import { findSkills } from "src/logic-functions/data/targetWorkspace/find-skills.util";
import { findWebhooks } from "src/logic-functions/data/targetWorkspace/find-webhooks.util";
import { createMetadataEntity } from "src/logic-functions/data/targetWorkspace/create-metadata-entity.util";
import { findRoles } from "src/logic-functions/data/targetWorkspace/find-roles.util";
import { upsertPermissionFlags, upsertObjectPermissions, upsertFieldPermissions } from "src/logic-functions/data/targetWorkspace/upsert-role-permissions.util";
import { findPageLayouts } from "src/logic-functions/data/targetWorkspace/find-page-layouts.util";
import { updatePageLayoutWithTabsAndWidgets } from "src/logic-functions/data/targetWorkspace/update-page-layout-with-tabs-and-widgets.util";
import { type PageLayoutTab } from "src/logic-functions/types/dashboard.type";

// Logic:
// Read all apps
// Filter out all OAuth installed apps (to exclude Claude and other AI MCP related apps)
// Inform user that they need to install missing apps
// Read all objects and fields
// Find custom workspace app's id (for future references)
// Filter out all those created by apps (inform user about it?)
// Re-create objects and fields using GraphQL API
// Using REST API read all objects and re-create them (what about the order?)

// Notes:
// This run does NOT resume across invocations - if a workspace is too large to migrate
// within timeoutSeconds (capped at 900s / 15min platform-wide), it will simply stop partway.
// Records already created stay created; re-running is not idempotent (no dedupe by source id).
// Rate limiting against the 140k/280k-records-per-15min quota is handled reactively: writes
// are wrapped in executeWithRetry, which backs off and retries on 429/502/503/504/network
// errors instead of pacing every request with a fixed delay.

const fieldsToOmit = ['id', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'deletedAt', 'position', 'searchVector', 'timelineActivities', 'attachments', 'noteTargets', 'taskTargets'];
const objectsToOmit = ['workflow', 'workflowRun', 'workflowVersion', 'workflowAutomatedTrigger', 'timelineActivity'];
// workspaceMember/dashboard still need their SCHEMA synced (a workspace may have added custom
// fields to either), so they stay out of objectsToOmit and go through Stage 2/3/4 normally -
// but their RECORDS are skipped in Stage 5 specifically:
// - workspaceMember: the server hard-blocks createOne/createMany for it regardless of
//   caller/role (workspace members are provisioned by the real invite/sign-up flow, not the
//   API). Existing target members are matched to source members by email instead (see
//   mergedWorkspaceMembers) and fed into recordIdMap so other objects' relation fields
//   (assignee, accountOwner, owner, ...) that point at a workspace member still get correctly
//   remapped.
// - dashboard: it needs the PageLayout tree built first (Stage 7) before the Dashboard record
//   itself can point at it - the generic Stage 5 loop can't sequence that.
const objectsToOmitFromRecordMigration = ['workspaceMember', 'dashboard'];
const sourceAppsToOmit = ['OAUTH_ONLY', 'LOCAL'];

function mapEntities<T extends { universalIdentifier: string }>(a: T[]) {
  return new Map(a.map(n => [n.universalIdentifier, n]));
}

function extractNodes<T>(connection: { edges: { node: T }[] }): T[] {
  return connection.edges.map(edge => edge.node);
}

const areObjectsIdentical = (a: ObjectType, b: ObjectType) => {
  return a.color === b.color &&
    a.description === b.description &&
    a.isLabelSyncedWithName === b.isLabelSyncedWithName &&
    a.labelPlural === b.labelPlural &&
    a.labelSingular === b.labelSingular &&
    a.nameSingular === b.nameSingular &&
    a.namePlural === b.namePlural &&
    a.icon === b.icon;
}

const areRelationsIdentical = (a: FieldRelationInfo, b: FieldRelationInfo) => {
  return a.targetObjectMetadata.nameSingular === b.targetObjectMetadata.nameSingular &&
    a.targetFieldMetadata.icon === b.targetFieldMetadata.icon &&
    a.targetFieldMetadata.label === b.targetFieldMetadata.label;
}

const areMorphRelationsIdentical = (a: FieldRelationInfo[], b: FieldRelationInfo[]) => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((relationA) => {
    const relationB = b.find(
      (candidate) => candidate.targetObjectMetadata.nameSingular === relationA.targetObjectMetadata.nameSingular,
    );
    return relationB !== undefined && areRelationsIdentical(relationA, relationB);
  });
}

const areFieldsListsIdentical = (a: FieldsListType, b: FieldsListType) => {
  if (a.type === 'RELATION' && b.type === 'RELATION') {
    return a.description === b.description &&
      a.icon === b.icon &&
      a.isActive === b.isActive &&
      a.isLabelSyncedWithName === b.isLabelSyncedWithName &&
      a.isNullable === b.isNullable &&
      a.isUIEditable === b.isUIEditable &&
      a.isUIReadOnly === b.isUIReadOnly &&
      a.isUnique === b.isUnique &&
      a.label === b.label &&
      a.name === b.name &&
      JSON.stringify(a.settings) === JSON.stringify(b.settings) &&
      areRelationsIdentical(a.relation, b.relation);
  }

  if (a.type === 'MORPH_RELATION' && b.type === 'MORPH_RELATION') {
    return a.description === b.description &&
      a.icon === b.icon &&
      a.isActive === b.isActive &&
      a.isLabelSyncedWithName === b.isLabelSyncedWithName &&
      a.isNullable === b.isNullable &&
      a.isUIEditable === b.isUIEditable &&
      a.isUIReadOnly === b.isUIReadOnly &&
      a.isUnique === b.isUnique &&
      a.label === b.label &&
      a.name === b.name &&
      JSON.stringify(a.settings) === JSON.stringify(b.settings) &&
      areMorphRelationsIdentical(a.morphRelations, b.morphRelations);
  }

  return JSON.stringify(a.defaultValue) === JSON.stringify(b.defaultValue) &&
    a.description === b.description &&
    a.icon === b.icon &&
    a.isActive === b.isActive &&
    a.isLabelSyncedWithName === b.isLabelSyncedWithName &&
    a.isNullable === b.isNullable &&
    a.isUIEditable === b.isUIEditable &&
    a.isUIReadOnly === b.isUIReadOnly &&
    a.isUnique === b.isUnique &&
    a.label === b.label &&
    a.name === b.name &&
    JSON.stringify(a.options) === JSON.stringify(b.options) &&
    JSON.stringify(a.settings) === JSON.stringify(b.settings);
}

const buildFieldToCreate = (
  field: FieldsListType,
  targetObjectId: string,
  targetObjects: { nameSingular: string, id: string, universalIdentifier: string }[],
): CreateOneFieldType | undefined => {
  if (field.type === FieldMetadataType.RELATION) {
    const targetRelationObjectId = targetObjects.find(
      obj => obj.nameSingular === field.relation?.targetObjectMetadata.nameSingular,
    )?.id;

    if (targetRelationObjectId === undefined) {
      console.warn(`Skipping relation field "${field.name}": relation target object not found in target workspace yet (possible dependency cycle)`);
      return undefined;
    }

    const relationCreationPayload = {
      type: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: targetRelationObjectId,
      targetFieldLabel: field.relation.targetFieldMetadata.label,
      targetFieldIcon: field.relation.targetFieldMetadata.icon,
    };
    return {
      objectMetadataId: targetObjectId,
      type: field.type,
      name: field.name,
      label: field.label,
      description: field.description,
      icon: field.icon,
      isActive: field.isActive,
      isNullable: field.isNullable,
      isUnique: field.isUnique,
      isUIEditable: field.isUIEditable,
      isUIReadOnly: field.isUIReadOnly,
      isLabelSyncedWithName: field.isLabelSyncedWithName,
      defaultValue: field.defaultValue,
      options: field.options,
      settings: field.settings,
      relationCreationPayload: relationCreationPayload,
    } as CreateOneFieldType;
  }

  if (field.type === 'MORPH_RELATION') {
    const morphRelationPayload: RelationCreationPayload[] = [];
    for (const relation of field.morphRelations) {
      const targetRelationObjectId = targetObjects.find(
        obj => obj.nameSingular === relation.targetObjectMetadata.nameSingular,
      )?.id;

      if (targetRelationObjectId === undefined) {
        console.warn(`Skipping relation field "${field.name}": relation target object not found in target workspace yet (possible dependency cycle)`);
        return undefined;
      }

      morphRelationPayload.push({
        type: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: targetRelationObjectId,
        targetFieldLabel: relation.targetFieldMetadata.label,
        targetFieldIcon: relation.targetFieldMetadata.icon,
      });
    }
    return {
      objectMetadataId: targetObjectId,
      type: field.type,
      name: field.name,
      label: field.label,
      description: field.description,
      icon: field.icon,
      isActive: field.isActive,
      isNullable: field.isNullable,
      isUnique: field.isUnique,
      isUIEditable: field.isUIEditable,
      isUIReadOnly: field.isUIReadOnly,
      isLabelSyncedWithName: field.isLabelSyncedWithName,
      defaultValue: field.defaultValue,
      options: field.options,
      settings: field.settings,
      morphRelationsCreationPayload: morphRelationPayload,
    } as CreateOneFieldType;
  }

  return {
    objectMetadataId: targetObjectId,
    type: field.type,
    name: field.name,
    label: field.label,
    description: field.description,
    icon: field.icon,
    isActive: field.isActive,
    isNullable: field.isNullable,
    isUnique: field.isUnique,
    isUIEditable: field.isUIEditable,
    isUIReadOnly: field.isUIReadOnly,
    isLabelSyncedWithName: field.isLabelSyncedWithName,
    defaultValue: field.defaultValue,
    options: field.options,
    settings: field.settings,
  } as CreateOneFieldType;
};

// Remaps a record's MANY_TO_ONE foreign key ids from source-workspace record ids to
// target-workspace record ids. Unresolvable references (target record not migrated,
// e.g. out of scope, or a forward reference to a not-yet-migrated record of the same
// object) are dropped with a warning rather than failing the record.
const buildRecordDataToCreate = (
  node: Record<string, unknown>,
  dataKeys: string[],
  relationForeignKeyNames: string[],
  recordIdMap: Map<string, string>,
): Record<string, unknown> => {
  const data: Record<string, unknown> = {};

  for (const key of dataKeys) {
    if (relationForeignKeyNames.includes(key)) {
      const sourceRecordId = node[key];
      if (sourceRecordId === null || sourceRecordId === undefined) {
        data[key] = null;
        continue;
      }
      const targetRecordId = recordIdMap.get(sourceRecordId as string);
      if (targetRecordId === undefined) {
        console.warn(`Dropping relation "${key}": referenced record ${sourceRecordId as string} was not migrated`);
        continue;
      }
      data[key] = targetRecordId;
      continue;
    }
    data[key] = node[key];
  }

  return data;
};

const migrateRecordsForObject = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  sourceObject: ObjectType,
  recordIdMap: Map<string, string>,
) => {
  const plan = buildRecordFieldPlan(sourceObject.fieldsList, fieldsToOmit);
  const enumDataKeys = new Set(plan.enumDataKeys);

  let after: string | null = null;
  let migratedCount = 0;

  while (true) {
    const page = await findManyRecords(sourceWorkspace, sourceObject.namePlural, plan.selectionSet, after);
    const nodes = page.edges.map((edge) => edge.node);

    if (nodes.length > 0) {
      const dataToCreate = nodes.map((node) =>
        buildRecordDataToCreate(node, plan.dataKeys, plan.relationForeignKeyNames, recordIdMap),
      );
      const created = await executeWithRetry(() =>
        createManyRecords(targetWorkspace, sourceObject.namePlural, dataToCreate, enumDataKeys),
      );

      // createMany returns records in the same order as the input array (a single
      // multi-row INSERT...RETURNING), so source/target ids can be zipped by index.
      nodes.forEach((node, index) => {
        recordIdMap.set(node.id as string, created[index].id);
      });
      migratedCount += nodes.length;
    }

    if (!page.pageInfo.hasNextPage) {
      break;
    }
    after = page.pageInfo.endCursor;
  }

  console.log(`Migrated ${migratedCount} record(s) for ${sourceObject.nameSingular}`);
};

const migrateViews = async (
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
      await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createView', 'input', 'CreateViewInput', {
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
      await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createViewFieldGroup', 'input', 'CreateViewFieldGroupInput', {
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
      await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createViewField', 'input', 'CreateViewFieldInput', {
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
          await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createViewFilterGroup', 'input', 'CreateViewFilterGroupInput', {
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
      await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createViewFilter', 'input', 'CreateViewFilterInput', {
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
      await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createViewSort', 'input', 'CreateViewSortInput', {
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
      await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createViewGroup', 'input', 'CreateViewGroupInput', {
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

const migrateNavigationMenuItems = async (
  targetWorkspace: AxiosInstance,
  sourceItems: Awaited<ReturnType<typeof findNavigationMenuItems>>,
  targetItems: Awaited<ReturnType<typeof findNavigationMenuItems>>,
  targetObjectIdBySourceObjectId: Map<string, string>,
  recordIdMap: Map<string, string>,
) => {
  // Folders can be parents of other items, so an item is only attempted once its folder (if
  // any) is already resolved in the target. Items skipped for any reason (personal, page
  // layout, unresolved target) are never marked resolved, so anything nested under them is
  // correctly left unresolved too, rather than pointing at a folder that was never created.
  const resolvedItemIds = new Set(targetItems.map((item) => item.id));
  const remainingItems = [...sourceItems];
  let createdCount = 0;

  while (remainingItems.length > 0) {
    const creatableNow = remainingItems.filter(
      (item) => item.folderId === null || resolvedItemIds.has(item.folderId),
    );
    if (creatableNow.length === 0) {
      console.warn(`Skipping ${remainingItems.length} navigation menu item(s): unresolved folder chain`);
      break;
    }

    for (const item of creatableNow) {
      remainingItems.splice(remainingItems.indexOf(item), 1);

      if (resolvedItemIds.has(item.id)) {
        continue;
      }
      if (item.userWorkspaceId !== null) {
        console.warn(`Skipping personal navigation menu item "${item.name ?? item.id}": personal items aren't portable across workspaces via API key`);
        continue;
      }
      if (item.pageLayoutId !== null) {
        console.warn(`Skipping navigation menu item "${item.name ?? item.id}": page layouts aren't migrated by this tool`);
        continue;
      }

      const targetObjectMetadataId = item.targetObjectMetadataId !== null
        ? targetObjectIdBySourceObjectId.get(item.targetObjectMetadataId)
        : undefined;
      if (item.targetObjectMetadataId !== null && targetObjectMetadataId === undefined) {
        console.warn(`Skipping navigation menu item "${item.name ?? item.id}": target object not found for object ${item.targetObjectMetadataId}`);
        continue;
      }

      const targetRecordId = item.targetRecordId !== null
        ? recordIdMap.get(item.targetRecordId)
        : undefined;
      if (item.targetRecordId !== null && targetRecordId === undefined) {
        console.warn(`Skipping navigation menu item "${item.name ?? item.id}": target record not found for record ${item.targetRecordId}`);
        continue;
      }

      await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createNavigationMenuItem', 'input', 'CreateNavigationMenuItemInput', {
        id: item.id,
        targetRecordId: targetRecordId ?? null,
        targetObjectMetadataId: targetObjectMetadataId ?? null,
        viewId: item.viewId,
        type: item.type,
        name: item.name,
        link: item.link,
        icon: item.icon,
        color: item.color,
        folderId: item.folderId,
        position: item.position,
      }));
      resolvedItemIds.add(item.id);
      createdCount += 1;
    }
  }

  console.log(`Navigation menu items: created ${createdCount}`);
};

const migrateSkills = async (targetWorkspace: AxiosInstance, sourceSkills: Awaited<ReturnType<typeof findSkills>>, targetSkills: Awaited<ReturnType<typeof findSkills>>) => {
  const existingTargetSkillIds = new Set(targetSkills.map((skill) => skill.id));

  let createdCount = 0;
  for (const skill of sourceSkills) {
    // Standard skills already exist in every workspace by construction (and the server
    // blocks non-standard-app callers from modifying them) - only custom ones need migrating.
    if (!skill.isCustom || existingTargetSkillIds.has(skill.id)) {
      continue;
    }
    await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createSkill', 'input', 'CreateSkillInput', {
      id: skill.id,
      name: skill.name,
      label: skill.label,
      icon: skill.icon,
      description: skill.description,
      content: skill.content,
    }));
    createdCount += 1;
  }

  console.log(`Skills: created ${createdCount}`);
};

const migrateWebhooks = async (targetWorkspace: AxiosInstance, sourceWebhooks: Awaited<ReturnType<typeof findWebhooks>>, targetWebhooks: Awaited<ReturnType<typeof findWebhooks>>) => {
  const existingTargetWebhookIds = new Set(targetWebhooks.map((webhook) => webhook.id));

  let createdCount = 0;
  for (const webhook of sourceWebhooks) {
    if (existingTargetWebhookIds.has(webhook.id)) {
      continue;
    }
    // `secret` is deliberately not copied - omitting it makes the server generate a fresh
    // one, so the two workspaces don't end up sharing the same HMAC signing key.
    await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createWebhook', 'input', 'CreateWebhookInput', {
      id: webhook.id,
      targetUrl: webhook.targetUrl,
      operations: webhook.operations,
      description: webhook.description,
    }));
    createdCount += 1;
  }

  console.log(`Webhooks: created ${createdCount}. Review each targetUrl - the receiving endpoint may not expect events from this new workspace.`);
};

const migrateRoles = async (
  targetWorkspace: AxiosInstance,
  sourceRoles: Awaited<ReturnType<typeof findRoles>>,
  targetRoles: Awaited<ReturnType<typeof findRoles>>,
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
) => {
  // Unlike view/nav-item/skill/webhook create inputs, CreateRoleInput has no client-settable
  // `id` - the row id (and universalIdentifier) are always server-generated. `label` is the
  // real dedup key instead: it's workspace-uniquely enforced with a clean
  // ROLE_LABEL_ALREADY_EXISTS error. A role's permissions are therefore only ever set once,
  // at creation time - re-running this migration never touches an already-migrated role.
  const targetRoleIdByLabel = new Map(targetRoles.map((role) => [role.label, role.id]));

  let createdCount = 0;

  for (const role of sourceRoles) {
    if (targetRoleIdByLabel.has(role.label)) {
      continue;
    }

    if (role.rowLevelPermissionPredicates.length > 0 || role.rowLevelPermissionPredicateGroups.length > 0) {
      console.warn(`Role "${role.label}": has row-level permission predicates, which this tool doesn't migrate - review manually`);
    }

    const created = await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createOneRole', 'createRoleInput', 'CreateRoleInput', {
      label: role.label,
      description: role.description,
      icon: role.icon,
      canUpdateAllSettings: role.canUpdateAllSettings,
      canAccessAllTools: role.canAccessAllTools,
      canReadAllObjectRecords: role.canReadAllObjectRecords,
      canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
      canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
      canBeAssignedToUsers: role.canBeAssignedToUsers,
      canBeAssignedToAgents: role.canBeAssignedToAgents,
      canBeAssignedToApiKeys: role.canBeAssignedToApiKeys,
    }));
    const targetRoleId = created.id;
    createdCount += 1;

    if (role.permissionFlags.length > 0) {
      await executeWithRetry(() =>
        upsertPermissionFlags(targetWorkspace, targetRoleId, role.permissionFlags.map((flag) => flag.flag)),
      );
    }

    const objectPermissions = role.objectPermissions.flatMap((permission) => {
      const targetObjectMetadataId = targetObjectIdBySourceObjectId.get(permission.objectMetadataId);
      if (targetObjectMetadataId === undefined) {
        console.warn(`Role "${role.label}": skipping object permission - target object not found for object ${permission.objectMetadataId}`);
        return [];
      }
      return [{
        objectMetadataId: targetObjectMetadataId,
        canReadObjectRecords: permission.canReadObjectRecords,
        canUpdateObjectRecords: permission.canUpdateObjectRecords,
        canSoftDeleteObjectRecords: permission.canSoftDeleteObjectRecords,
        canDestroyObjectRecords: permission.canDestroyObjectRecords,
      }];
    });
    if (objectPermissions.length > 0) {
      await executeWithRetry(() => upsertObjectPermissions(targetWorkspace, targetRoleId, objectPermissions));
    }

    const fieldPermissions = role.fieldPermissions.flatMap((permission) => {
      const targetObjectMetadataId = targetObjectIdBySourceObjectId.get(permission.objectMetadataId);
      const targetFieldMetadataId = targetFieldIdBySourceFieldId.get(permission.fieldMetadataId);
      if (targetObjectMetadataId === undefined || targetFieldMetadataId === undefined) {
        console.warn(`Role "${role.label}": skipping field permission - target field not found for field ${permission.fieldMetadataId}`);
        return [];
      }
      return [{
        objectMetadataId: targetObjectMetadataId,
        fieldMetadataId: targetFieldMetadataId,
        canReadFieldValue: permission.canReadFieldValue,
        canUpdateFieldValue: permission.canUpdateFieldValue,
      }];
    });
    if (fieldPermissions.length > 0) {
      await executeWithRetry(() => upsertFieldPermissions(targetWorkspace, targetRoleId, fieldPermissions));
    }
  }

  console.log(`Roles: created ${createdCount}`);
};

// The keys a widget's `configuration` blob can hold a fieldMetadataId under, across every
// chart/field-bearing widget type (see find-page-layouts.util.ts for the confirmed per-type
// field lists). Checking "does this key exist on the object" generically, rather than
// branching per widget type, covers all of them without needing to know which type is which -
// `viewId`/`frontComponentId` are deliberately left untouched: views and front components keep
// the same id across workspaces (views are migrated with their source id reused in Stage 6;
// front components belong to apps, already kept in sync by the Stage 1 app-version check).
const WIDGET_CONFIGURATION_FIELD_METADATA_ID_KEYS = [
  'aggregateFieldMetadataId',
  'primaryAxisGroupByFieldMetadataId',
  'secondaryAxisGroupByFieldMetadataId',
  'groupByFieldMetadataId',
  'fieldMetadataId',
  'nestedRelationFieldMetadataId',
];

const remapWidgetConfiguration = (
  configuration: Record<string, unknown>,
  targetFieldIdBySourceFieldId: Map<string, string>,
): Record<string, unknown> => {
  const remapped = { ...configuration };
  for (const key of WIDGET_CONFIGURATION_FIELD_METADATA_ID_KEYS) {
    const sourceFieldId = remapped[key];
    if (typeof sourceFieldId === 'string') {
      remapped[key] = targetFieldIdBySourceFieldId.get(sourceFieldId) ?? null;
    }
  }
  return remapped;
};

// Builds the `tabs` input for updatePageLayoutWithTabsAndWidgets: fresh client-minted ids for
// every tab/widget (this mutation creates anything whose id isn't already found on the target
// layout, so populating a brand-new empty layout works the same as updating an existing one),
// widget objectMetadataId/configuration remapped against the target workspace, and VIEW-type
// widgets skipped - the one widget type still rejected even through this bulk mutation.
const buildPageLayoutTabsInput = (
  sourceTabs: PageLayoutTab[],
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
  warningContext: string,
): Record<string, unknown>[] => {
  return sourceTabs.map((tab) => {
    const targetTabId = crypto.randomUUID();

    const widgets = tab.widgets.flatMap((widget) => {
      if (widget.type === 'VIEW') {
        console.warn(`Skipping widget "${widget.title}" on ${warningContext}: VIEW-type widgets aren't supported by the API yet`);
        return [];
      }

      const targetObjectMetadataId = widget.objectMetadataId !== null
        ? targetObjectIdBySourceObjectId.get(widget.objectMetadataId)
        : undefined;
      if (widget.objectMetadataId !== null && targetObjectMetadataId === undefined) {
        console.warn(`Skipping widget "${widget.title}" on ${warningContext}: target object not found for object ${widget.objectMetadataId}`);
        return [];
      }

      return [{
        id: crypto.randomUUID(),
        pageLayoutTabId: targetTabId,
        title: widget.title,
        type: widget.type,
        objectMetadataId: targetObjectMetadataId ?? null,
        gridPosition: widget.gridPosition,
        configuration: remapWidgetConfiguration(widget.configuration, targetFieldIdBySourceFieldId),
      }];
    });

    return {
      id: targetTabId,
      title: tab.title,
      position: tab.position,
      layoutMode: tab.layoutMode,
      widgets,
    };
  });
};

const applyPageLayoutTabsAndWidgets = async (
  targetWorkspace: AxiosInstance,
  targetPageLayoutId: string,
  sourceTabs: PageLayoutTab[],
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
  warningContext: string,
): Promise<void> => {
  const tabs = buildPageLayoutTabsInput(sourceTabs, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId, warningContext);
  await executeWithRetry(() => updatePageLayoutWithTabsAndWidgets(targetWorkspace, targetPageLayoutId, tabs));
};

const migrateDashboards = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
) => {
  const readAllDashboards = async (client: AxiosInstance, selectionSet: string) => {
    const nodes: Record<string, unknown>[] = [];
    let after: string | null = null;
    while (true) {
      const page = await findManyRecords(client, 'dashboards', selectionSet, after);
      nodes.push(...page.edges.map((edge) => edge.node));
      if (!page.pageInfo.hasNextPage) {
        break;
      }
      after = page.pageInfo.endCursor;
    }
    return nodes;
  };

  const sourceDashboards = await readAllDashboards(sourceWorkspace, 'title\npageLayoutId\nposition');
  const targetDashboards = await readAllDashboards(targetWorkspace, 'id');
  const existingTargetDashboardIds = new Set(targetDashboards.map((node) => node.id as string));

  const sourcePageLayouts = await findPageLayouts(sourceWorkspace, 'DASHBOARD');
  const sourcePageLayoutById = new Map(sourcePageLayouts.map((layout) => [layout.id, layout]));

  let createdCount = 0;

  for (const dashboard of sourceDashboards) {
    const dashboardId = dashboard.id as string;
    const title = dashboard.title as string;

    // PageLayout has no client-settable id or natural key (unlike Dashboard itself), so
    // re-run idempotency only works one level up: if a Dashboard with the reused source id
    // already exists, its whole layout tree was already built in a prior run, and the entire
    // dashboard - not just parts of it - is skipped.
    if (existingTargetDashboardIds.has(dashboardId)) {
      continue;
    }

    const sourcePageLayout = sourcePageLayoutById.get(dashboard.pageLayoutId as string);
    if (sourcePageLayout === undefined) {
      console.warn(`Skipping dashboard "${title}": its page layout was not found`);
      continue;
    }

    try {
      const targetLayoutObjectMetadataId = sourcePageLayout.objectMetadataId !== null
        ? targetObjectIdBySourceObjectId.get(sourcePageLayout.objectMetadataId) ?? null
        : null;

      const createdPageLayout = await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createPageLayout', 'input', 'CreatePageLayoutInput', {
        name: sourcePageLayout.name,
        type: sourcePageLayout.type,
        objectMetadataId: targetLayoutObjectMetadataId,
      }));

      await applyPageLayoutTabsAndWidgets(
        targetWorkspace,
        createdPageLayout.id,
        sourcePageLayout.tabs,
        targetObjectIdBySourceObjectId,
        targetFieldIdBySourceFieldId,
        `dashboard "${title}"`,
      );

      await executeWithRetry(() => createManyRecords(targetWorkspace, 'dashboards', [{
        id: dashboardId,
        title,
        pageLayoutId: createdPageLayout.id,
        position: dashboard.position,
      }], new Set()));
      createdCount += 1;
    } catch (error) {
      // A dashboard whose layout/tab/widget tree fails to apply can't be meaningfully
      // partially migrated - skip it and move on to the rest.
      console.warn(`Skipping dashboard "${title}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(`Dashboards: created ${createdCount}`);
};

const migrateRecordPageLayouts = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
) => {
  const sourcePageLayouts = await findPageLayouts(sourceWorkspace, 'RECORD_PAGE');
  const targetPageLayouts = await findPageLayouts(targetWorkspace, 'RECORD_PAGE');

  // Every object gets an auto-provisioned system RECORD_PAGE layout for free the moment the
  // object itself is created (a side effect of createOneObject, not something this stage
  // does) - only non-system layouts represent actual customization worth migrating.
  const customSourcePageLayouts = sourcePageLayouts.filter((layout) => !layout.isSystemSideEffect);
  // Dedup key: unlike Dashboard, there's no sibling record with a client-settable id to anchor
  // idempotency on here, so this falls back to (target object, name) - not a database-enforced
  // unique constraint, but the best available signal without one.
  const existingTargetLayoutKeys = new Set(
    targetPageLayouts
      .filter((layout) => !layout.isSystemSideEffect)
      .map((layout) => `${layout.objectMetadataId}::${layout.name}`),
  );

  let createdCount = 0;

  for (const sourceLayout of customSourcePageLayouts) {
    const targetObjectMetadataId = sourceLayout.objectMetadataId !== null
      ? targetObjectIdBySourceObjectId.get(sourceLayout.objectMetadataId)
      : undefined;
    if (targetObjectMetadataId === undefined) {
      console.warn(`Skipping record page layout "${sourceLayout.name}": target object not found for object ${sourceLayout.objectMetadataId}`);
      continue;
    }

    if (existingTargetLayoutKeys.has(`${targetObjectMetadataId}::${sourceLayout.name}`)) {
      continue;
    }

    try {
      const createdPageLayout = await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createPageLayout', 'input', 'CreatePageLayoutInput', {
        name: sourceLayout.name,
        type: sourceLayout.type,
        objectMetadataId: targetObjectMetadataId,
      }));

      await applyPageLayoutTabsAndWidgets(
        targetWorkspace,
        createdPageLayout.id,
        sourceLayout.tabs,
        targetObjectIdBySourceObjectId,
        targetFieldIdBySourceFieldId,
        `record page layout "${sourceLayout.name}"`,
      );
      createdCount += 1;
    } catch (error) {
      console.warn(`Skipping record page layout "${sourceLayout.name}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(`Record page layouts: created ${createdCount}`);
};

const handler = async () => {
  // Stage 1: read all apps

  const targetWorkspace = axios.create({
    baseURL: `${process.env.TARGET_WORKSPACE_API_URL}`,
    timeout: 5000,
    headers: {
      'Authorization': `Bearer ${process.env.TARGET_WORKSPACE_API_KEY}`,
    }
  });
  const sourceWorkspace = axios.create({
    baseURL: `${process.env.SOURCE_WORKSPACE_API_URL}`,
    timeout: 5000,
    headers: {
      'Authorization': `Bearer ${process.env.SOURCE_WORKSPACE_API_KEY}`,
    }
  });

  const { data: sourceWorkspaceInstalledApps } = await findInstalledApplications(sourceWorkspace);
  const { data: targetWorkspaceInstalledApps } = await findInstalledApplications(targetWorkspace);
  const sourceApps: Record<string, { name: string, version: string }> = {};
  sourceWorkspaceInstalledApps.findManyApplications.filter((app) => app.applicationRegistration !== null && sourceAppsToOmit.indexOf(app.applicationRegistration.sourceType) === -1).map((app) => sourceApps[app.universalIdentifier] = {
    name: app.name,
    version: app.version
  });
  const { universalIdentifier: sourceStandardAppUUID } = sourceWorkspaceInstalledApps.findManyApplications.filter(app => !app.canBeUninstalled && app.applicationRegistration === null)[0];
  const { universalIdentifier: sourceCustomAppUUID } = sourceWorkspaceInstalledApps.findManyApplications.filter(app => !app.canBeUninstalled && app.applicationRegistration?.sourceType === 'LOCAL')[0];
  const targetApps: Record<string, string> = {}; // <uuid, version>
  const { universalIdentifier: targetStandardAppUUID } = targetWorkspaceInstalledApps.findManyApplications.filter(app => !app.canBeUninstalled && app.applicationRegistration === null)[0];
  const { universalIdentifier: targetCustomAppUUID } = targetWorkspaceInstalledApps.findManyApplications.filter(app => !app.canBeUninstalled && app.applicationRegistration?.sourceType === 'LOCAL')[0];
  targetWorkspaceInstalledApps.findManyApplications.filter((app) => app.applicationRegistration !== null && sourceAppsToOmit.indexOf(app.applicationRegistration.sourceType) === -1).map((app) => targetApps[app.universalIdentifier] = app.version);
  const sourceAppsIds = Object.keys(sourceApps);
  const missingAppsIds = sourceAppsIds.filter((app) => Object.keys(targetApps).indexOf(app) < 0);
  if (missingAppsIds.length > 0) {
    console.error('Install missing apps: '.concat(...missingAppsIds.map(id => sourceApps[id].name)));
    return;
  }
  // check if apps have the same version
  const diffVerApps: string[] = [];
  for (const key of Object.keys(sourceApps)) {
    if (sourceApps[key].version !== targetApps[key]) {
      diffVerApps.push(key);
    }
  }
  if (diffVerApps.length > 0) {
    console.error('Update following apps to latest version: '.concat(...diffVerApps.map(id => sourceApps[id].name)));
  }

  // Check for workspace members to prevent data loss with X object to workspace members relation
  const sourceWorkspaceMembers = extractNodes((await FindWorkspaceMembers(sourceWorkspace)).data.workspaceMembers);
  const targetWorkspaceMembers = extractNodes((await FindWorkspaceMembers(targetWorkspace)).data.workspaceMembers);
  const missingWorkspaceMembers = sourceWorkspaceMembers.filter(mem => targetWorkspaceMembers.find(mem2 => mem2.userEmail === mem.userEmail) === undefined);
  if (missingWorkspaceMembers.length > 0) {
    console.error("Add missing workspace members before proceeding:", ...missingWorkspaceMembers.filter(mem => mem.userEmail));
    return;
  }
  // merge both workspaceMembers arrays into one
  const mergedWorkspaceMembers: {oldId: string, newId: string}[] = [];
  for (const sourceMember of sourceWorkspaceMembers) {
    const targetMember = targetWorkspaceMembers.find(mem => mem.userEmail === sourceMember.userEmail);
    if (targetMember === undefined) {
      console.warn(`Skipping workspace member "${sourceMember.userEmail}": no matching member found in target workspace`);
      continue;
    }
    mergedWorkspaceMembers.push({ oldId: sourceMember.id, newId: targetMember.id });
  }

  // Stage 2: compare objects and fields between 2 workspaces
  // compare standard objects and check if they need an update
  // compare standard fields and check if they need an update
  // filter out id, createdBy, createdAt, updatedAt

  const { data: sourceWorkspaceObjectsFields } = await FindAllObjectsAndFields(sourceWorkspace);
  const { data: targetWorkspaceObjectsFields } = await FindAllObjectsAndFields(targetWorkspace);
  const extractedSourceWorkspaceObjects = extractNodes(sourceWorkspaceObjectsFields.objects).filter(n => objectsToOmit.includes(n.nameSingular) === false);
  const extractedTargetWorkspaceObjects = extractNodes(targetWorkspaceObjectsFields.objects).filter(n => objectsToOmit.includes(n.nameSingular) === false);
  const systemSourceObjects = mapEntities(extractedSourceWorkspaceObjects.filter(n => n.applicationId === sourceStandardAppUUID));
  const systemTargetObjects = mapEntities(extractedTargetWorkspaceObjects.filter(n => n.applicationId === targetStandardAppUUID));
  // we don't want app-based objects or fields
  const customSourceObjects = mapEntities(extractedSourceWorkspaceObjects.filter(n => n.applicationId === sourceCustomAppUUID));
  // when workspace is created, there are no custom objects hence no customTargetObjects variable
  const objectsToUpdate: Map<string, UpdateOneObjectType> = new Map(); // standard, keyed by target object id
  const fieldsToCreate: CreateOneFieldType[] = [];
  const fieldsToUpdate: Map<string, UpdateOneFieldType> = new Map(); // standard, keyed by target field id

  const targetWorkspaceObjects: { nameSingular: string, id: string, universalIdentifier: string }[] = [];

  const filterFields = (fieldsList: FieldsListType[]) => {
    return fieldsList.filter(field => fieldsToOmit.includes(field.name) === false && [targetStandardAppUUID, targetCustomAppUUID].includes(field.applicationId) && !(field.type === 'RELATION' && field.relation.type === 'ONE_TO_MANY'));
  }

  for (const object of extractedTargetWorkspaceObjects) {
    targetWorkspaceObjects.push(object);
  }
  // starting from recreating custom objects so that any relation from/to custom object to/from standard object can be easily introduced
  for (const key of Array.from(customSourceObjects.keys())) {
    const object = customSourceObjects.get(key);
    if (object === undefined) {
      continue;
    }

    const isJunctionObject = object.fieldsList.find(field => field.id === object.labelIdentifierFieldMetadataId)?.name === 'id';
    // fair assumption that target workspace has no custom objects at the time (other than those installed by apps)
    const createdObject = await executeWithRetry(() =>
      createOneObject(targetWorkspace, { ...object, skipNameField: isJunctionObject }),
    );
    targetWorkspaceObjects.push(createdObject);
  }

  // compare standard objects and their fields
  for (const key of Array.from(systemSourceObjects.keys())) {
    const sourceObject = systemSourceObjects.get(key);
    // guardrail against typechecker
    if (sourceObject === undefined) {
      continue;
    }
    const targetObject = systemTargetObjects.get(key);
    if (targetObject === undefined) {
      continue; // not possible but it needs to be here
    }
    if (!areObjectsIdentical(sourceObject, targetObject)) {
      objectsToUpdate.set(targetObject.id, sourceObject);
    }
    const sourceObjectFields = mapEntities(filterFields(sourceObject.fieldsList));
    const targetObjectFields = mapEntities(filterFields(targetObject.fieldsList));
    for (const key of Array.from(sourceObjectFields.keys())) {
      const sourceObjectField = sourceObjectFields.get(key);
      if (sourceObjectField === undefined) {
        continue;
      }
      const targetObjectField = targetObjectFields.get(key);
      if (targetObjectField === undefined) {
        const fieldToCreate = buildFieldToCreate(sourceObjectField, targetObject.id, targetWorkspaceObjects);
        if (fieldToCreate !== undefined) {
          fieldsToCreate.push(fieldToCreate);
        }
      } else if (!areFieldsListsIdentical(sourceObjectField, targetObjectField)) {
        // TODO: check if separate function is needed to build a proper field given the relations
        fieldsToUpdate.set(targetObjectField.id, sourceObjectField);
      }
    }
  }

  for (const key of Array.from(customSourceObjects.keys())) {
    const object = customSourceObjects.get(key);
    if (object === undefined) {
      continue;
    }
    const targetObjectId = targetWorkspaceObjects.find(obj => obj.nameSingular === object.nameSingular)?.id;
    if (targetObjectId === undefined) {
      continue;
    }
    for (const field of filterFields(object.fieldsList)) {
      const fieldToCreate = buildFieldToCreate(field, targetObjectId, targetWorkspaceObjects);
      if (fieldToCreate !== undefined) {
        fieldsToCreate.push(fieldToCreate);
      }
    }
  }

  // Stage 3 & 4: recreate objects and fields, respecting relation dependencies

  for (const [targetObjectId, update] of objectsToUpdate) {
    await executeWithRetry(() => updateOneObject(targetWorkspace, targetObjectId, update));
  }

  for (const [targetFieldId, update] of fieldsToUpdate) {
    await executeWithRetry(() => updateOneField(targetWorkspace, targetFieldId, update));
  }

  for (const field of fieldsToCreate) {
    await executeWithRetry(() => createOneField(targetWorkspace, field));
  }

  // Stage 5: migrate records, in the same relation-dependency order used for schema creation,
  // but spanning both standard and custom objects (a standard object's records can depend on
  // a custom object's records and vice versa). workspaceMember/dashboard are filtered out
  // before sorting, not after: sortObjectsByDependency already treats a relation target that's
  // absent from its input list as "no ordering constraint" (their target ids are resolved by
  // other means - mergedWorkspaceMembers, Stage 7 - so no dependency edge is needed here).
  const recordMigrationOrder = sortObjectsByDependency([
    ...Array.from(systemSourceObjects.values()),
    ...Array.from(customSourceObjects.values()),
  ].filter((object) => !objectsToOmitFromRecordMigration.includes(object.nameSingular)));
  // Seeded with the source-to-target workspace member id mapping so that relation fields on
  // other objects (task.assignee, company.accountOwner, opportunity.owner, ...) resolve
  // through the same generic FK-remapping path buildRecordDataToCreate already uses for
  // record-to-record relations - it doesn't care what object a foreign key points at, only
  // whether the source id is a known key.
  const recordIdMap = new Map<string, string>(
    mergedWorkspaceMembers.map((member) => [member.oldId, member.newId]),
  );
  const targetObjectIdByNameSingular = new Map(
    targetWorkspaceObjects.map((obj) => [obj.nameSingular, obj.id]),
  );

  for (const sourceObject of recordMigrationOrder) {
    const targetObjectId = targetObjectIdByNameSingular.get(sourceObject.nameSingular);
    if (targetObjectId === undefined) {
      console.warn(`Skipping records for "${sourceObject.nameSingular}": no matching target object (schema creation may have failed for it)`);
      continue;
    }
    await migrateRecordsForObject(sourceWorkspace, targetWorkspace, sourceObject, recordIdMap);
  }

  // Stage 6: migrate views (and all view-related sub-entities), navigation menu items,
  // skills, webhooks, and roles (including their object/field permissions).
  //
  // objectMetadataId/fieldMetadataId references need remapping against the target workspace's
  // own metadata ids (which are freshly server-generated, unlike the ids reused above) - the
  // maps used for schema creation are now stale after Stage 3&4 created new fields, so this
  // re-fetches the target's current objects/fields and rebuilds them by (object, field) name.
  const { data: refetchedTargetWorkspaceObjectsFields } = await FindAllObjectsAndFields(targetWorkspace);
  const refetchedTargetObjectsByNameSingular = new Map(
    extractNodes(refetchedTargetWorkspaceObjectsFields.objects).map((object) => [object.nameSingular, object]),
  );
  const targetObjectIdBySourceObjectId = new Map<string, string>();
  const targetFieldIdBySourceFieldId = new Map<string, string>();
  for (const sourceObject of extractedSourceWorkspaceObjects) {
    const targetObject = refetchedTargetObjectsByNameSingular.get(sourceObject.nameSingular);
    if (targetObject === undefined) {
      continue;
    }
    targetObjectIdBySourceObjectId.set(sourceObject.id, targetObject.id);

    const targetFieldIdByName = new Map(targetObject.fieldsList.map((field) => [field.name, field.id]));
    for (const sourceField of sourceObject.fieldsList) {
      const targetFieldId = targetFieldIdByName.get(sourceField.name);
      if (targetFieldId !== undefined) {
        targetFieldIdBySourceFieldId.set(sourceField.id, targetFieldId);
      }
    }
  }

  const sourceViews = await findViews(sourceWorkspace);
  const targetViews = await findViews(targetWorkspace);
  await migrateViews(targetWorkspace, sourceViews, targetViews, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

  const sourceNavigationMenuItems = await findNavigationMenuItems(sourceWorkspace);
  const targetNavigationMenuItems = await findNavigationMenuItems(targetWorkspace);
  await migrateNavigationMenuItems(targetWorkspace, sourceNavigationMenuItems, targetNavigationMenuItems, targetObjectIdBySourceObjectId, recordIdMap);

  const sourceSkills = await findSkills(sourceWorkspace);
  const targetSkills = await findSkills(targetWorkspace);
  await migrateSkills(targetWorkspace, sourceSkills, targetSkills);

  const sourceWebhooks = await findWebhooks(sourceWorkspace);
  const targetWebhooks = await findWebhooks(targetWorkspace);
  await migrateWebhooks(targetWorkspace, sourceWebhooks, targetWebhooks);

  const sourceRoles = await findRoles(sourceWorkspace);
  const targetRoles = await findRoles(targetWorkspace);
  await migrateRoles(targetWorkspace, sourceRoles, targetRoles, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

  // Stage 7: migrate dashboards. Dashboard is a thin pointer (pageLayoutId) into the
  // PageLayout/PageLayoutTab/PageLayoutWidget tree (the same system record-page layouts use),
  // so it needs its own stage rather than falling into the generic Stage 5 record loop -
  // `dashboard` stays in objectsToOmit for exactly that reason.
  await migrateDashboards(sourceWorkspace, targetWorkspace, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

  // Stage 8: migrate custom (non-system) RECORD_PAGE layouts - the tabs/widgets a workspace
  // added on top of an object's auto-provisioned default record-page layout.
  await migrateRecordPageLayouts(sourceWorkspace, targetWorkspace, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);

  return;
};

export default defineLogicFunction({
  universalIdentifier: 'b058e57c-4ac6-4b18-b147-9099260da9de',
  name: 'entry-point',
  description: 'Add a description for your logic function',
  timeoutSeconds: 900,
  handler,
  // Add your trigger here
  // Route trigger example:
  // httpRouteTriggerSettings: {
  //   path: '/entry-point',
  //   httpMethod: 'POST',
  //   isAuthRequired: true,
  // },
  // Cron trigger example:
  // cronTriggerSettings: {
  //   pattern: '0 0 * * *', // Daily at midnight
  // },
  // Database event trigger example:
  // databaseEventTriggerSettings: {
  //   eventName: 'objectName.created',
  // },
});
