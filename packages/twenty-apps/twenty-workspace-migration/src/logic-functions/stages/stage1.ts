import { findInstalledApplications } from "src/logic-functions/requests/find-installed-applications.util";
import { FindWorkspaceMembers } from "src/logic-functions/requests/find-workspace-members.util";
import { FindAllObjectsAndFields } from "src/logic-functions/requests/find-all-objects-and-fields.util";
import { UpdateOneObjectType } from "src/logic-functions/types/update-one-object.type";
import { CreateOneFieldType } from "src/logic-functions/types/create-one-field.type";
import { UpdateOneFieldType } from "src/logic-functions/types/update-one-field.type";
import { createOneObject } from "src/logic-functions/requests/create-one-object.util";
import { areFieldsListsIdentical, areObjectsIdentical } from "src/logic-functions/utils/comparators.util";
import { type AxiosInstance } from "axios";
import { extractNodes } from "src/logic-functions/utils/extract-nodes.util";
import { mapEntities } from "src/logic-functions/utils/map-entities.util";
import { fieldsToOmit, objectsToOmit, sourceAppsToOmit } from "src/constants/to-omit";
import { buildFieldToCreate } from "src/logic-functions/utils/build-field-to-create.util";
import { saveMigrationStateCheckpointAndStop, setStateRef } from "src/logic-functions/utils/migration-state.util";
import { buildRecordMigrationOrder } from "src/logic-functions/utils/build-record-migration-order.util";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { estimateMigrationDuration } from "src/logic-functions/utils/estimate-migration-duration.util";
import { logger } from "src/logic-functions/utils/logger.util";
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
  const { universalIdentifier: sourceCustomAppUUID } = sourceWorkspaceInstalledApps.findManyApplications.filter(app => !app.canBeUninstalled && app.applicationRegistration?.sourceType === 'LOCAL')[0];
  const targetApps: Record<string, string> = {}; // <uuid, version>
  targetWorkspaceInstalledApps.findManyApplications.filter((app) => app.applicationRegistration !== null && sourceAppsToOmit.indexOf(app.applicationRegistration.sourceType) === -1).map((app) => targetApps[app.universalIdentifier] = app.version);
  const sourceAppsIds = Object.keys(sourceApps);
  const missingAppsIds = sourceAppsIds.filter((app) => Object.keys(targetApps).indexOf(app) < 0);
  if (missingAppsIds.length > 0) {
    logger.error('Install missing apps: '.concat(...missingAppsIds.map(id => sourceApps[id].name)));
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
    logger.error('Update following apps to latest version: '.concat(...diffVerApps.map(id => sourceApps[id].name)));
  }

  // Check for workspace members to prevent data loss with X object to workspace members relation
  const sourceWorkspaceMembers = extractNodes((await executeWithRetry(() => FindWorkspaceMembers(sourceWorkspace))).data.workspaceMembers);
  const targetWorkspaceMembers = extractNodes((await executeWithRetry(() => FindWorkspaceMembers(targetWorkspace))).data.workspaceMembers);
  const targetWorkspaceMemberByEmail = new Map(targetWorkspaceMembers.map(mem => [mem.userEmail, mem]));
  const missingWorkspaceMembers = sourceWorkspaceMembers.filter(mem => targetWorkspaceMemberByEmail.get(mem.userEmail) === undefined);
  if (missingWorkspaceMembers.length > 0) {
    logger.error("Add missing workspace members before proceeding:", ...missingWorkspaceMembers.filter(mem => mem.userEmail));
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

  const { data: sourceWorkspaceObjectsFields } = await executeWithRetry(() => FindAllObjectsAndFields(sourceWorkspace));
  const { data: targetWorkspaceObjectsFields } = await executeWithRetry(() => FindAllObjectsAndFields(targetWorkspace));
  const mappedSourceObjects = mapEntities(extractNodes(sourceWorkspaceObjectsFields.objects).filter(n => objectsToOmit.includes(n.nameSingular) === false));
  const mappedTargetObjects = mapEntities(extractNodes(targetWorkspaceObjectsFields.objects).filter(n => objectsToOmit.includes(n.nameSingular) === false));

  const objectsToUpdate: UpdateOneObjectType[] = [];
  const fieldsToCreate: CreateOneFieldType[] = [];
  const fieldsToUpdate: UpdateOneFieldType[] = [];

  const targetWorkspaceObjects: { nameSingular: string, id: string, universalIdentifier: string }[] = [];

  for (const object of mappedTargetObjects.values()) {
    targetWorkspaceObjects.push(object);
  }
  // starting from recreating custom objects so that any relation from/to custom object to/from standard object can be easily introduced
  for (const key of Array.from(mappedSourceObjects.keys())) {
    const object = mappedSourceObjects.get(key);
    if (object === undefined || object.applicationId !== sourceCustomAppUUID) {
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
  for (const key of Array.from(mappedSourceObjects.keys())) {
    const sourceObject = mappedSourceObjects.get(key);
    // guardrail against typechecker
    if (sourceObject === undefined) {
      continue;
    }
    const targetObject = mappedTargetObjects.get(key);
    if (targetObject === undefined) {
      continue; // not possible but it needs to be here
    }
    if (!areObjectsIdentical(sourceObject, targetObject)) {
      objectsToUpdate.push({ id: targetObject.id, object: sourceObject });
    }
    const sourceObjectFields = mapEntities(sourceObject.fieldsList.filter(field => fieldsToOmit.includes(field.name) === false));
    const targetObjectFields = mapEntities(targetObject.fieldsList.filter(field => fieldsToOmit.includes(field.name) === false));
    for (const key of Array.from(sourceObjectFields.keys())) {
      const sourceObjectField = sourceObjectFields.get(key);
      if (sourceObjectField === undefined || (sourceObjectField.type === 'RELATION' && sourceObjectField.relation.type === 'ONE_TO_MANY')) {
        continue;
      }
      const targetObjectField = targetObjectFields.get(key);
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

  const recordMigrationOrder = buildRecordMigrationOrder([...mappedSourceObjects.values()]);

  const { estimatedMinutes, batchableRecordCount, otherRecordCount } = await estimateMigrationDuration(
    sourceWorkspace,
  );
  logger.log(`Estimated migration time: ~${estimatedMinutes} minute(s) worst case (${batchableRecordCount} record(s) via createManyRecords, ${otherRecordCount} attachment(s))`);

  setStateRef('sourceWorkspaceObjects', [...mappedSourceObjects.values()]);
  setStateRef('objectsToUpdate', objectsToUpdate);
  setStateRef('fieldsToCreate', fieldsToCreate);
  setStateRef('fieldsToUpdate', fieldsToUpdate);
  setStateRef('recordMigrationOrder', recordMigrationOrder);
  setStateRef('estimate', { estimatedMinutes, batchableRecordCount, otherRecordCount });
  setStateRef('stage', 2);
  await saveMigrationStateCheckpointAndStop();
}