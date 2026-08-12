import { defineLogicFunction } from 'twenty-sdk/define';
import axios, { type AxiosInstance } from "axios";
import { findInstalledApplications } from "src/logic-functions/data/targetWorkspace/find-installed-applications.util";
import { FindAllObjectsAndFields } from "src/logic-functions/data/targetWorkspace/find-all-objects-and-fields.util";
import { createOneObject } from "src/logic-functions/data/targetWorkspace/create-one-object.util";
import { updateOneObject } from "src/logic-functions/data/targetWorkspace/update-one-object.util";
import { createOneField } from "src/logic-functions/data/targetWorkspace/create-one-field.util";
import { updateOneField } from "src/logic-functions/data/targetWorkspace/update-one-field.util";
import { findManyRecords } from "src/logic-functions/data/targetWorkspace/find-many-records.util";
import { createOneRecord } from "src/logic-functions/data/targetWorkspace/create-one-record.util";
import { FieldsListType, ObjectType, RelationType } from "src/logic-functions/types/find-objects-fields.type";
import { CreateOneObjectType } from "src/logic-functions/types/create-one-object.type";
import { UpdateOneObjectType } from "src/logic-functions/types/update-one-object.type";
import { CreateOneFieldType, RelationCreationPayload } from "src/logic-functions/types/create-one-field.type";
import { UpdateOneFieldType } from "src/logic-functions/types/update-one-field.type";
import { FieldMetadataType } from "src/logic-functions/types/field-metadata-type.enum";
import { buildRecordFieldPlan } from "src/logic-functions/utils/build-record-field-plan.util";
import { sortObjectsByDependency } from "src/logic-functions/utils/sort-objects-by-dependency.util";
import { sleep } from "src/logic-functions/utils/sleep.util";

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
// Rate limiting against the 140k/280k-records-per-15min quota is a fixed delay between
// requests (REQUEST_DELAY_MS), not adaptive - tune it for the target plan if needed.

const fieldsToOmit = ['id', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'deletedAt', 'position', 'searchVector', 'timelineActivities', 'attachments', 'noteTargets', 'taskTargets'];
const objectsToOmit = ['dashboard', 'workflow', 'workflowRun', 'workflowVersion'];
const sourceAppsToOmit = ['OAUTH_ONLY', 'LOCAL'];
const REQUEST_DELAY_MS = 50;

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

const areFieldsListsIdentical = (a: FieldsListType, b: FieldsListType) => {
  return a.defaultValue === b.defaultValue &&
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
    a.options === b.options &&
    a.settings === b.settings;
}

const toCreateOneObjectType = (object: ObjectType): CreateOneObjectType => ({
  ...object,
  // The target's own fields are recreated explicitly, so skip the mutation's default name field
  // in every case - relying on it would collide with the explicit "name"-like field we create.
  skipNameField: true,
});

// Builds the wire payload for creating `field` on `targetObjectId`, resolving a MANY_TO_ONE
// relation's target through `targetObjectIdByUniversalIdentifier`. Returns undefined when the
// field must not be explicitly created:
// - MORPH_RELATION fields are out of scope for this migration.
// - ONE_TO_MANY relation fields are always the auto-created reciprocal of a MANY_TO_ONE field
//   on the other object - creating them explicitly would collide with that auto-created field.
// - A MANY_TO_ONE field whose target hasn't been created yet (dependency cycle) is skipped
//   with a warning rather than failing the whole migration.
const buildFieldToCreate = (
  field: FieldsListType,
  targetObjectId: string,
  targetObjectIdByUniversalIdentifier: Map<string, string>,
): CreateOneFieldType | undefined => {
  if (field.type === FieldMetadataType.MORPH_RELATION) {
    console.warn(`Skipping field "${field.name}": morph relations are not supported by this migration`);
    return undefined;
  }

  let relationCreationPayload: RelationCreationPayload | undefined;

  if (field.type === FieldMetadataType.RELATION) {
    if (field.relation?.type !== RelationType.MANY_TO_ONE) {
      return undefined;
    }

    const targetRelationObjectId = targetObjectIdByUniversalIdentifier.get(
      field.relation.targetObjectMetadata.universalIdentifier,
    );

    if (targetRelationObjectId === undefined) {
      console.warn(`Skipping relation field "${field.name}": relation target object not found in target workspace yet (possible dependency cycle)`);
      return undefined;
    }

    relationCreationPayload = {
      type: field.relation.type,
      targetObjectMetadataId: targetRelationObjectId,
      targetFieldLabel: field.label,
      targetFieldIcon: field.icon,
    };
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
    relationCreationPayload,
  };
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
  targetObjectId: string,
  recordIdMap: Map<string, string>,
) => {
  const plan = buildRecordFieldPlan(sourceObject.fieldsList, fieldsToOmit);
  const enumDataKeys = new Set(plan.enumDataKeys);

  let after: string | null = null;
  let migratedCount = 0;

  while (true) {
    const page = await findManyRecords(sourceWorkspace, sourceObject.namePlural, plan.selectionSet, after);

    for (const node of page.edges.map((edge) => edge.node)) {
      const data = buildRecordDataToCreate(node, plan.dataKeys, plan.relationForeignKeyNames, recordIdMap);
      const created = await createOneRecord(targetWorkspace, sourceObject.nameSingular, data, enumDataKeys);

      recordIdMap.set(node.id as string, created.id);
      migratedCount += 1;

      await sleep(REQUEST_DELAY_MS);
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

  // Stage 2: compare objects and fields between 2 workspaces
  // compare standard objects and check if they need an update
  // compare standard fields and check if they need an update
  // filter out id, createdBy, createdAt, updatedAt

  const { data: sourceWorkspaceObjectsFields } = await FindAllObjectsAndFields(sourceWorkspace);
  const { data: targetWorkspaceObjectsFields } = await FindAllObjectsAndFields(targetWorkspace);
  const extractedSourceWorkspaceObjects = extractNodes(sourceWorkspaceObjectsFields.objects).filter(n => objectsToOmit.includes(n.nameSingular) === false);
  const extractedTargetWorkspaceObjects = extractNodes(targetWorkspaceObjectsFields.objects).filter(n => objectsToOmit.includes(n.nameSingular) === false);
  const systemSourceObjects = mapEntities(extractedSourceWorkspaceObjects.filter(n => !n.isSystem && n.applicationId === sourceStandardAppUUID));
  const systemTargetObjects = mapEntities(extractedTargetWorkspaceObjects.filter(n => n.applicationId === sourceCustomAppUUID));
  // we don't want app-based objects or fields
  const customSourceObjects = mapEntities(extractedSourceWorkspaceObjects.filter(n => !n.isSystem && n.applicationId === targetStandardAppUUID));
  // when workspace is created, there are no custom objects hence no customTargetObjects variable
  const objectsToCreate: CreateOneObjectType[] = []; // custom
  const objectsToUpdate: Map<string, UpdateOneObjectType> = new Map(); // standard, keyed by target object id
  const fieldsToCreate: { field: FieldsListType; targetObjectId: string }[] = [];
  const fieldsToUpdate: Map<string, UpdateOneFieldType> = new Map(); // standard, keyed by target field id

  // compare standard objects and their fields
  for (const key of Array.from(systemSourceObjects.keys())) {
    const sourceObject = systemSourceObjects.get(key);
    // guardrail against typechecker
    if (sourceObject === undefined) {
      continue;
    }
    const targetObject = systemTargetObjects.get(key);
    if (targetObject === undefined) {
      continue; // should actually create?
    }
    if (!areObjectsIdentical(sourceObject, targetObject)) {
      objectsToUpdate.set(targetObject.id, sourceObject);
    }
    const sourceObjectFields = mapEntities(sourceObject.fieldsList.filter(field => fieldsToOmit.includes(field.name) === false && [sourceStandardAppUUID, sourceCustomAppUUID].includes(field.applicationId)));
    const targetObjectFields = mapEntities(targetObject.fieldsList.filter(field => fieldsToOmit.includes(field.name) === false && [targetStandardAppUUID, targetCustomAppUUID].includes(field.applicationId)));
    for (const key of Array.from(sourceObjectFields.keys())) {
      const sourceObjectField = sourceObjectFields.get(key);
      if (sourceObjectField === undefined) {
        continue;
      }
      const targetObjectField = targetObjectFields.get(key);
      if (targetObjectField === undefined) {
        fieldsToCreate.push({ field: sourceObjectField, targetObjectId: targetObject.id });
      } else if (!areFieldsListsIdentical(sourceObjectField, targetObjectField)) {
        fieldsToUpdate.set(targetObjectField.id, sourceObjectField);
      }
    }
  }

  for (const key of Array.from(customSourceObjects.keys())) {
    const object = customSourceObjects.get(key);
    // stupid guardrail against TS typechecker
    if (object === undefined) {
      continue;
    }

    const isJunctionObject = object.fieldsList.find(field => field.id === object.labelIdentifierFieldMetadataId)?.name === 'id';
    // fair assumption that target workspace has no custom objects at the time (other than those installed by apps)
    objectsToCreate.push({...object, skipNameField: isJunctionObject});
  }

  // Stage 3 & 4: recreate objects and fields, respecting relation dependencies

  // Standard objects and fields already exist on both sides, so there's no ordering
  // constraint - a standard relation field can only ever target another standard object,
  // which is always already present.
  const targetObjectIdByUniversalIdentifier = new Map<string, string>(
    Array.from(systemTargetObjects.entries()).map(([universalIdentifier, target]) => [universalIdentifier, target.id]),
  );

  for (const [targetObjectId, update] of objectsToUpdate) {
    await updateOneObject(targetWorkspace, targetObjectId, update);
    await sleep(REQUEST_DELAY_MS);
  }

  for (const [targetFieldId, update] of fieldsToUpdate) {
    await updateOneField(targetWorkspace, targetFieldId, update);
    await sleep(REQUEST_DELAY_MS);
  }

  for (const { field, targetObjectId } of fieldsToCreate) {
    const fieldToCreate = buildFieldToCreate(field, targetObjectId, targetObjectIdByUniversalIdentifier);
    if (fieldToCreate === undefined) {
      continue;
    }
    await createOneField(targetWorkspace, fieldToCreate);
    await sleep(REQUEST_DELAY_MS);
  }

  // Custom objects: create in dependency order so a MANY_TO_ONE field's target object
  // always exists by the time that field gets created.
  const sortedObjectsToCreate = sortObjectsByDependency(objectsToCreate);

  for (const object of sortedObjectsToCreate) {
    const created = await createOneObject(targetWorkspace, toCreateOneObjectType(object));
    targetObjectIdByUniversalIdentifier.set(object.universalIdentifier, created.id);

    const createdFieldIdByName = new Map<string, string>(
      created.fieldsList.map((field) => [field.name, field.id]),
    );

    const sourceLabelField = object.fieldsList.find(
      (field) => field.id === object.labelIdentifierFieldMetadataId,
    );
    // labelIdentifierFieldMetadataId pointing at the reserved "id" field means this object
    // has no meaningful name-like field (e.g. a pure junction object) - the target's default
    // (also "id", since skipNameField is always true) already matches, nothing to update.
    const isJunctionObject = sourceLabelField?.name === 'id';

    const customFieldsForObject = object.fieldsList.filter(
      (field) => field.applicationId === sourceCustomAppUUID && fieldsToOmit.includes(field.name) === false,
    );

    for (const field of customFieldsForObject) {
      const fieldToCreate = buildFieldToCreate(field, created.id, targetObjectIdByUniversalIdentifier);
      if (fieldToCreate === undefined) {
        continue;
      }
      const createdField = await createOneField(targetWorkspace, fieldToCreate);
      createdFieldIdByName.set(createdField.name, createdField.id);
      await sleep(REQUEST_DELAY_MS);
    }

    if (!isJunctionObject && sourceLabelField !== undefined) {
      const targetLabelFieldId = createdFieldIdByName.get(sourceLabelField.name);
      if (targetLabelFieldId !== undefined) {
        await updateOneObject(targetWorkspace, created.id, { labelIdentifierFieldMetadataId: targetLabelFieldId });
        await sleep(REQUEST_DELAY_MS);
      }
    }
  }

  // Stage 5: migrate records, in the same relation-dependency order used for schema creation,
  // but spanning both standard and custom objects (a standard object's records can depend on
  // a custom object's records and vice versa).
  const recordMigrationOrder = sortObjectsByDependency([
    ...Array.from(systemSourceObjects.values()),
    ...Array.from(customSourceObjects.values()),
  ]);
  const recordIdMap = new Map<string, string>();

  for (const sourceObject of recordMigrationOrder) {
    const targetObjectId = targetObjectIdByUniversalIdentifier.get(sourceObject.universalIdentifier);
    if (targetObjectId === undefined) {
      console.warn(`Skipping records for "${sourceObject.nameSingular}": no matching target object (schema creation may have failed for it)`);
      continue;
    }
    await migrateRecordsForObject(sourceWorkspace, targetWorkspace, sourceObject, targetObjectId, recordIdMap);
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
