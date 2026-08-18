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
import { fieldsToOmit, objectsToOmit, objectsToOmitFromRecordMigration, sourceAppsToOmit } from "src/constants/to-omit";
import { buildFieldToCreate } from "src/logic-functions/utils/build-field-to-create.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { setStateRef } from "src/logic-functions/utils/migration-state.util";
import { sortObjectsByDependency } from "src/logic-functions/utils/sort-objects-by-dependency.util";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";

export const stage1 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  // Before any migration, check if all apps are installed with the same version and all workspace members are in new instance
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
  const mergedWorkspaceMembers: { oldId: string, newId: string }[] = [];
  for (const sourceMember of sourceWorkspaceMembers) {
    const targetMember = targetWorkspaceMembers.find(mem => mem.userEmail === sourceMember.userEmail);
    if (targetMember === undefined) {
      console.warn(`Skipping workspace member "${sourceMember.userEmail}": no matching member found in target workspace`);
      continue;
    }
    mergedWorkspaceMembers.push({ oldId: sourceMember.id, newId: targetMember.id });
  }
  setStateRef('mergedWorkspaceMembers', mergedWorkspaceMembers);

  // compare standard objects and fields and check if they need an update
  // compare custom objects and fields and check if they need an update

  const { data: sourceWorkspaceObjectsFields } = await executeWithRetryAndCheckpoint(() => FindAllObjectsAndFields(sourceWorkspace));
  const { data: targetWorkspaceObjectsFields } = await executeWithRetryAndCheckpoint(() => FindAllObjectsAndFields(targetWorkspace));
  const extractedSourceWorkspaceObjects = extractNodes(sourceWorkspaceObjectsFields.objects).filter(n => objectsToOmit.includes(n.nameSingular) === false);
  const extractedTargetWorkspaceObjects = extractNodes(targetWorkspaceObjectsFields.objects).filter(n => objectsToOmit.includes(n.nameSingular) === false);

  const systemSourceObjects = mapEntities(extractedSourceWorkspaceObjects.filter(n => n.applicationId === sourceStandardAppUUID));
  const systemTargetObjects = mapEntities(extractedTargetWorkspaceObjects.filter(n => n.applicationId === targetStandardAppUUID));
  const customSourceObjects = mapEntities(extractedSourceWorkspaceObjects.filter(n => n.applicationId !== sourceStandardAppUUID));

  const objectsToUpdate: UpdateOneObjectType[] = [];
  const fieldsToCreate: CreateOneFieldType[] = [];
  const fieldsToUpdate: UpdateOneFieldType[] = [];

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
      objectsToUpdate.push({ id: targetObject.id, object: sourceObject });
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
        fieldsToUpdate.push({ id: targetObjectField.id, field: sourceObjectField });
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

  const recordMigrationOrder = sortObjectsByDependency([
    ...Array.from(systemSourceObjects.values()),
    ...Array.from(customSourceObjects.values()),
  ].filter((object) => [...objectsToOmit, ...objectsToOmitFromRecordMigration].includes(object.nameSingular) === false));

  setStateRef('objectsToUpdate', objectsToUpdate);
  setStateRef('fieldsToCreate', fieldsToCreate);
  setStateRef('fieldsToUpdate', fieldsToUpdate);
  setStateRef('recordMigrationOrder', recordMigrationOrder);
  setStateRef('stage', 2);
}