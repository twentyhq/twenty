import {
  loadMigrationStateCheckpoint,
  migrationState,
  saveMigrationStateCheckpoint,
  setMigrationStage,
  setStateRef
} from "src/logic-functions/utils/migration-state.util";
import { chunk } from "src/logic-functions/utils/chunk";
import { updateOneObject } from "src/logic-functions/requests/update-one-object.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { updateOneField } from "src/logic-functions/requests/update-one-field.util";
import { createOneField } from "src/logic-functions/requests/create-one-field.util";
import { AxiosInstance } from "axios";
import { extractNodes } from "src/logic-functions/utils/extract-nodes.util";
import { FindAllObjectsAndFields } from "src/logic-functions/requests/find-all-objects-and-fields.util";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { objectsToOmit } from "src/constants/to-omit";

export const stage2 = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  await loadMigrationStateCheckpoint();

  const objectsToUpdate = migrationState.objectsToUpdate;
  const fieldsToUpdate = migrationState.fieldsToUpdate;
  const fieldsToCreate = migrationState.fieldsToCreate;

  if (objectsToUpdate.length > 0) {
    const objectChunks = chunk(objectsToUpdate, 50);
    for (let index = 0; index < objectChunks.length; index += 1) {
      for (const object of objectChunks[index]) {
        await executeWithRetry(() => updateOneObject(targetWorkspace, object));
      }
      setStateRef('objectsToUpdate', objectsToUpdate.slice((index + 1) * 50));
      await saveMigrationStateCheckpoint();
    }
  }

  if (fieldsToUpdate.length > 0) {
    const fieldsToUpdateChunks = chunk(fieldsToUpdate, 50);
    for (let index = 0; index < fieldsToUpdateChunks.length; index += 1) {
      for (const field of fieldsToUpdateChunks[index]) {
        await executeWithRetry(() => updateOneField(targetWorkspace, field));
      }
      setStateRef('fieldsToUpdate', fieldsToUpdate.slice((index + 1) * 50));
      await saveMigrationStateCheckpoint();
    }
  }

  if (fieldsToCreate.length > 0) {
    const fieldsToCreateChunks = chunk(fieldsToCreate, 50);
    for (let index = 0; index < fieldsToCreateChunks.length; index += 1) {
      for (const field of fieldsToCreateChunks[index]) {
        await executeWithRetry(() => createOneField(targetWorkspace, field));
      }
      setStateRef('fieldsToCreate', fieldsToCreate.slice((index + 1) * 50));
      await saveMigrationStateCheckpoint();
    }
  }

  const { data: sourceWorkspaceObjectsFields } = await executeWithRetryAndCheckpoint(() => FindAllObjectsAndFields(sourceWorkspace));
  const extractedSourceWorkspaceObjects = extractNodes(sourceWorkspaceObjectsFields.objects).filter(n => objectsToOmit.includes(n.nameSingular) === false);
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
  setStateRef('targetObjectIdBySourceObjectId', targetObjectIdBySourceObjectId);
  setStateRef('targetFieldIdBySourceFieldId', targetFieldIdBySourceFieldId);
  setStateRef('targetWorkspaceObjects', extractNodes(refetchedTargetWorkspaceObjectsFields.objects))
  setStateRef('stage', 3)
}