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
const objectsToOmit = ['dashboard', 'workflow', 'workflowRun', 'workflowVersion', 'workflowAutomatedTrigger', 'timelineActivity'];
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

// Order-independent: each morph target is matched to its counterpart by object name,
// since the same set of targets can legitimately come back in a different array order.
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
): CreateOneFieldType => {
  if (field.type === FieldMetadataType.RELATION) {
    const targetRelationObjectId = targetObjects.find(
      obj => obj.nameSingular === field.relation?.targetObjectMetadata.nameSingular,
    )?.id;

    if (targetRelationObjectId === undefined) {
      console.warn(`Skipping relation field "${field.name}": relation target object not found in target workspace yet (possible dependency cycle)`);
      // @ts-ignore
      return;
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
        // @ts-ignore
        return;
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
  const targetAppsIds = Object.keys(targetApps);
  const missingAppsIds = targetAppsIds.filter((app) => Object.keys(sourceApps).indexOf(app) < 0);
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
  const mergedWorkspaceMembers: {oldId: string, email: string, newId: string}[] = [];
  for (const sourceMember of sourceWorkspaceMembers) {
    const targetMember = targetWorkspaceMembers.find(mem => mem.userEmail === sourceMember.userEmail);
    if (targetMember === undefined) {
      console.warn(`Skipping workspace member "${sourceMember.userEmail}": no matching member found in target workspace`);
      continue;
    }
    mergedWorkspaceMembers.push({ oldId: sourceMember.id, email: sourceMember.userEmail, newId: targetMember.id });
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
        fieldsToCreate.push(buildFieldToCreate(sourceObjectField, targetObject.id, targetWorkspaceObjects));
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
      fieldsToCreate.push(buildFieldToCreate(field, targetObjectId, targetWorkspaceObjects))
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
  // a custom object's records and vice versa).
  const recordMigrationOrder = sortObjectsByDependency([
    ...Array.from(systemSourceObjects.values()),
    ...Array.from(customSourceObjects.values()),
  ]);
  const recordIdMap = new Map<string, string>();
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
