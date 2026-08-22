import {
  migrationState,
  saveMigrationStateCheckpointAndStop,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { chunk } from "src/logic-functions/utils/chunk";
import { updateOneObject } from "src/logic-functions/requests/update-one-object.util";
import { updateOneField } from "src/logic-functions/requests/update-one-field.util";
import { createOneField } from "src/logic-functions/requests/create-one-field.util";
import { AxiosInstance } from "axios";
import { extractNodes } from "src/logic-functions/utils/extract-nodes.util";
import { FindAllObjectsAndFields } from "src/logic-functions/requests/find-all-objects-and-fields.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { decapitalize } from "src/logic-functions/utils/decapitalize.util";

const ATTACHMENT_TARGET_FIELD_NAME_PREFIX = 'target';

export const stage2 = async (targetWorkspace: AxiosInstance) => {
  const objectsToUpdate = migrationState.objectsToUpdate;
  const fieldsToUpdate = migrationState.fieldsToUpdate;
  const fieldsToCreate = migrationState.fieldsToCreate;

  if (objectsToUpdate.length > 0) {
    const objectChunks = chunk(objectsToUpdate, migrationState.maxRequests);
    for (let index = 0; index < objectChunks.length; index += 1) {
      for (const object of objectChunks[index]) {
        await executeWithRetryAndCheckpoint(() => updateOneObject(targetWorkspace, object));
      }
      setStateRef('objectsToUpdate', objectsToUpdate.slice((index + 1) * migrationState.maxRequests));
      if (await stopIfTimeBudgetExceeded()) {
        return;
      }
    }
  }

  if (fieldsToUpdate.length > 0) {
    const fieldsToUpdateChunks = chunk(fieldsToUpdate, migrationState.maxRequests);
    for (let index = 0; index < fieldsToUpdateChunks.length; index += 1) {
      for (const field of fieldsToUpdateChunks[index]) {
        await executeWithRetryAndCheckpoint(() => updateOneField(targetWorkspace, field));
      }
      setStateRef('fieldsToUpdate', fieldsToUpdate.slice((index + 1) * migrationState.maxRequests));
      if (await stopIfTimeBudgetExceeded()) {
        return;
      }
    }
  }

  if (fieldsToCreate.length > 0) {
    const fieldsToCreateChunks = chunk(fieldsToCreate, migrationState.maxRequests);
    for (let index = 0; index < fieldsToCreateChunks.length; index += 1) {
      for (const field of fieldsToCreateChunks[index]) {
        await executeWithRetryAndCheckpoint(() => createOneField(targetWorkspace, field));
      }
      setStateRef('fieldsToCreate', fieldsToCreate.slice((index + 1) * migrationState.maxRequests));
      if (await stopIfTimeBudgetExceeded()) {
        return;
      }
    }
  }

  const extractedSourceWorkspaceObjects = migrationState.sourceWorkspaceObjects;
  const { data: refetchedTargetWorkspaceObjectsFields } = await executeWithRetryAndCheckpoint(() => FindAllObjectsAndFields(targetWorkspace));
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
  // Groundwork for stage 8 - attachments
  const isSourceObjectSystemByNameSingular = new Map(extractedSourceWorkspaceObjects.map((object) => [object.nameSingular, object.isSystem]));
  const sourceAttachmentObject = extractedSourceWorkspaceObjects.find((object) => object.nameSingular === 'attachment');
  const attachmentTargetFieldNameByObjectName = new Map<string, string>();
  for (const field of sourceAttachmentObject?.fieldsList ?? []) {
    if (!field.name.startsWith(ATTACHMENT_TARGET_FIELD_NAME_PREFIX) || field.name === ATTACHMENT_TARGET_FIELD_NAME_PREFIX) {
      continue;
    }
    const objectNameSingular = decapitalize(field.name.slice(ATTACHMENT_TARGET_FIELD_NAME_PREFIX.length));
    // isSourceObjectSystemByNameSingular.get(...) is undefined for a name that didn't round-trip
    // to a real object - treated the same as isSystem: true, i.e. excluded either way.
    if (isSourceObjectSystemByNameSingular.get(objectNameSingular) !== false) {
      continue;
    }
    attachmentTargetFieldNameByObjectName.set(objectNameSingular, field.name);
  }
  const targetAttachmentObject = refetchedTargetObjectsByNameSingular.get('attachment');
  const targetAttachmentFileFieldId = targetAttachmentObject?.fieldsList.find((field) => field.name === 'file')?.id ?? null;
  setStateRef('attachmentTargetFieldNameByObjectName', attachmentTargetFieldNameByObjectName);
  setStateRef('targetAttachmentFileFieldId', targetAttachmentFileFieldId);
  setStateRef('targetObjectIdBySourceObjectId', targetObjectIdBySourceObjectId);
  setStateRef('targetFieldIdBySourceFieldId', targetFieldIdBySourceFieldId);
  setStateRef('targetWorkspaceObjects', extractNodes(refetchedTargetWorkspaceObjectsFields.objects))
  setStateRef('stage', 3)
  await saveMigrationStateCheckpointAndStop();
}