import { findInstalledApplications } from "src/logic-functions/requests/find-installed-applications.util";
import { FindWorkspaceMembers } from "src/logic-functions/requests/find-workspace-members.util";
import { FindAllObjectsAndFields } from "src/logic-functions/requests/find-all-objects-and-fields.util";
import { UpdateOneObjectType } from "src/logic-functions/types/update-one-object.type";
import { CreateOneFieldType } from "src/logic-functions/types/create-one-field.type";
import { UpdateOneFieldType } from "src/logic-functions/types/update-one-field.type";
import { FieldsListType } from "src/logic-functions/types/find-objects-fields.type";
import { createOneObject } from "src/logic-functions/requests/create-one-object.util";
import { areFieldsListsIdentical, areObjectsIdentical } from "src/logic-functions/utils/comparators.util";
import { type AxiosInstance } from "axios";
import { extractNodes } from "src/logic-functions/utils/extract-nodes.util";
import { mapEntities } from "src/logic-functions/utils/map-entities.util";
import { fieldsToOmit, objectsToOmit, sourceAppsToOmit } from "src/constants/to-omit";
import { buildFieldToCreate } from "src/logic-functions/utils/build-field-to-create.util";
import { saveMigrationStateCheckpointAndStop, setStateRef } from "src/logic-functions/utils/migration-state.util";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { estimateMigrationDuration } from "src/logic-functions/utils/estimate-migration-duration.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";
import { fetchCurrentWorkspace } from "src/logic-functions/requests/fetch-current-workspace.util";

export const stage1 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  const currentWorkspace = await executeWithRetry(() => fetchCurrentWorkspace(sourceWorkspace));
  const MAX_REQUESTS = (currentWorkspace.length === 1 && currentWorkspace[0].metadata.plan === 'PRO') ? 50 : 100;
  setStateRef('maxRequests', MAX_REQUESTS);

  // Before any migration, check if all apps are installed with the same version and all workspace members are in new instance
  const { data: sourceWorkspaceInstalledApps } = await executeWithRetry(() => findInstalledApplications(sourceWorkspace));
  const { data: targetWorkspaceInstalledApps } = await executeWithRetry(() => findInstalledApplications(targetWorkspace));
  const sourceApps: Record<string, { name: string, version: string }> = {};
  sourceWorkspaceInstalledApps.findManyApplications.filter((app) => app.applicationRegistration !== null && sourceAppsToOmit.indexOf(app.applicationRegistration.sourceType) === -1).map((app) => sourceApps[app.universalIdentifier] = {
    name: app.name,
    version: app.version
  });
  // Each workspace has standard and custom workspace app by default so [0] is absolutely valid
  const { universalIdentifier: sourceCustomAppUUID } = sourceWorkspaceInstalledApps.findManyApplications.filter(app => !app.canBeUninstalled && app.applicationRegistration?.sourceType === 'LOCAL')[0];
  const targetApps: Record<string, string> = {}; // <uuid, version>
  targetWorkspaceInstalledApps.findManyApplications.filter((app) => app.applicationRegistration !== null && sourceAppsToOmit.indexOf(app.applicationRegistration.sourceType) === -1).map((app) => targetApps[app.universalIdentifier] = app.version);
  const sourceAppsIds = Object.keys(sourceApps);
  const missingAppsIds = sourceAppsIds.filter((app) => Object.keys(targetApps).indexOf(app) < 0);
  if (missingAppsIds.length > 0) {
    logger.error(`Install missing apps: ${missingAppsIds.map(id => sourceApps[id].name).join(', ')}`);
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
    logger.error(`Update following apps to latest version: ${diffVerApps.map(id => sourceApps[id].name).join(', ')}`);
    return;
  }

  // Check for workspace members to prevent data loss with X object to workspace members relation
  const sourceWorkspaceMembers = extractNodes((await executeWithRetry(() => FindWorkspaceMembers(sourceWorkspace))).data.workspaceMembers);
  const targetWorkspaceMembers = extractNodes((await executeWithRetry(() => FindWorkspaceMembers(targetWorkspace))).data.workspaceMembers);
  const targetWorkspaceMemberByEmail = new Map(targetWorkspaceMembers.map(mem => [mem.userEmail, mem]));
  const missingWorkspaceMembers = sourceWorkspaceMembers.filter(mem => targetWorkspaceMemberByEmail.get(mem.userEmail) === undefined);
  if (missingWorkspaceMembers.length > 0) {
    logger.error(`Add missing workspace members before proceeding: ${missingWorkspaceMembers.map(mem => mem.userEmail).join(', ')}`);
    return;
  }
  // merge both workspaceMembers arrays into one
  const mergedWorkspaceMembers: Map<string, string> = new Map();
  for (const sourceMember of sourceWorkspaceMembers) {
    const targetMember = targetWorkspaceMemberByEmail.get(sourceMember.userEmail);
    if (targetMember === undefined) {
      logger.warn(`Skipping workspace member "${sourceMember.userEmail}": no matching member found in target workspace`);
      continue;
    }
    mergedWorkspaceMembers.set(sourceMember.id, targetMember.id);
  }
  setStateRef('workspaceMemberIdMap', mergedWorkspaceMembers);

  // compare standard objects and fields and check if they need an update
  // compare custom objects and fields and check if they need an update

  const [sourceSchema, initialTargetSchema] = await Promise.all([
    executeWithRetry(() => FindAllObjectsAndFields(sourceWorkspace)),
    executeWithRetry(() => FindAllObjectsAndFields(targetWorkspace)),
  ]);
  const mappedSourceObjects = mapEntities(extractNodes(sourceSchema.data.objects).filter(n => objectsToOmit.includes(n.nameSingular) === false));

  const objectsToUpdate: UpdateOneObjectType[] = [];
  const fieldsToCreate: CreateOneFieldType[] = [];
  const fieldsToUpdate: UpdateOneFieldType[] = [];
  const targetWorkspaceObjects: { nameSingular: string, id: string, universalIdentifier: string }[] = [];

  // Custom objects are recreated first so a relation either way between a custom and a standard
  // object can be introduced afterwards. Existing names are read up front so a re-entry after a
  // timeout skips what it already created instead of failing on a duplicate name forever.
  let targetObjects = extractNodes(initialTargetSchema.data.objects);
  const existingTargetObjectNames = new Set(targetObjects.map((object) => object.nameSingular));
  let createdAnyObject = false;

  for (const key of Array.from(mappedSourceObjects.keys())) {
    const object = mappedSourceObjects.get(key);
    if (object === undefined || object.applicationId !== sourceCustomAppUUID) {
      continue;
    }
    if (existingTargetObjectNames.has(object.nameSingular)) {
      continue;
    }

    const isJunctionObject = object.fieldsList.find(field => field.id === object.labelIdentifierFieldMetadataId)?.name === 'id';
    await executeWithRetry(() =>
      createOneObject(targetWorkspace, { ...object, skipNameField: isJunctionObject }),
    );
    createdAnyObject = true;
    if (await stopIfTimeBudgetExceeded()) {
      return;
    }
  }

  // Only refetched when something was actually created - the ids of the new objects are needed
  // below, but a workspace with no custom objects (or a re-entry that skipped them all) already
  // has an accurate list.
  if (createdAnyObject) {
    targetObjects = extractNodes((await executeWithRetry(() => FindAllObjectsAndFields(targetWorkspace))).data.objects);
  }
  const extractedTargetObjects = targetObjects.filter(n => objectsToOmit.includes(n.nameSingular) === false);
  const mappedTargetObjects = mapEntities(extractedTargetObjects);
  const targetObjectByNameSingular = new Map(extractedTargetObjects.map((object) => [object.nameSingular, object]));
  for (const object of extractedTargetObjects) {
    targetWorkspaceObjects.push(object);
  }
  // compare standard objects and their fields
  for (const key of Array.from(mappedSourceObjects.keys())) {
    const sourceObject = mappedSourceObjects.get(key);
    // guardrail against typechecker
    if (sourceObject === undefined) {
      continue;
    }
    const isCustomObject = sourceObject.applicationId === sourceCustomAppUUID;
    const targetObject = isCustomObject
      ? targetObjectByNameSingular.get(sourceObject.nameSingular)
      : mappedTargetObjects.get(key);
    if (targetObject === undefined) {
      logger.warn(`Skipping object "${sourceObject.nameSingular}": no matching object in the target workspace`);
      continue;
    }
    if (!areObjectsIdentical(sourceObject, targetObject)) {
      objectsToUpdate.push({ id: targetObject.id, object: sourceObject });
    }
    const fieldKeyOf = (field: FieldsListType): string => isCustomObject ? field.name : field.universalIdentifier;
    const sourceObjectFields = sourceObject.fieldsList.filter(field => fieldsToOmit.includes(field.name) === false);
    const targetObjectFields = new Map(
      targetObject.fieldsList
        .filter(field => fieldsToOmit.includes(field.name) === false)
        .map(field => [fieldKeyOf(field), field]),
    );
    for (const sourceObjectField of sourceObjectFields) {
      if (sourceObjectField.type === 'RELATION' && sourceObjectField.relation.type === 'ONE_TO_MANY') {
        continue;
      }
      const targetObjectField = targetObjectFields.get(fieldKeyOf(sourceObjectField));
      if (targetObjectField === undefined) {
        const fieldToCreate = buildFieldToCreate(sourceObjectField, targetObject.id, targetWorkspaceObjects);
        if (fieldToCreate !== undefined) {
          fieldsToCreate.push(fieldToCreate);
        }
      } else if (!areFieldsListsIdentical(sourceObjectField, targetObjectField)) {
        fieldsToUpdate.push({ id: targetObjectField.id, field: sourceObjectField });
      }
    }
  }


  const { estimatedMinutes, batchableRecordCount, otherRecordCount } = await estimateMigrationDuration(
    sourceWorkspace,
  );
  logger.log(`Estimated migration time: ~${estimatedMinutes} minute(s) worst case (${batchableRecordCount} record(s) via createManyRecords, ${otherRecordCount} attachment(s))`);

  setStateRef('sourceWorkspaceObjects', [...mappedSourceObjects.values()]);
  setStateRef('objectsToUpdate', objectsToUpdate);
  setStateRef('fieldsToCreate', fieldsToCreate);
  setStateRef('fieldsToUpdate', fieldsToUpdate);
  setStateRef('estimate', { estimatedMinutes, batchableRecordCount, otherRecordCount });
  setStateRef('stage', 2);
  await saveMigrationStateCheckpointAndStop();
}