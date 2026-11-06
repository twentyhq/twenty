import { isPlainObject } from 'twenty-shared/utils';

const RECORD_STEP_TYPES_WRITING_THEIR_WHOLE_OBJECT_RECORD = new Set([
  'CREATE_RECORD',
  'UPSERT_RECORD',
]);

export type DroppedFieldsToUpdate = {
  stepId: unknown;
  fieldsToUpdate: unknown;
};

export const dropFieldsToUpdateFromCreateAndUpsertRecords = (
  steps: unknown,
): {
  steps: unknown;
  hasChanged: boolean;
  droppedNonEmptyFieldsToUpdate: DroppedFieldsToUpdate[];
} => {
  if (!Array.isArray(steps)) {
    return { steps, hasChanged: false, droppedNonEmptyFieldsToUpdate: [] };
  }

  let hasChanged = false;
  const droppedNonEmptyFieldsToUpdate: DroppedFieldsToUpdate[] = [];

  const updatedSteps = steps.map((step: unknown) => {
    if (
      !isPlainObject(step) ||
      !RECORD_STEP_TYPES_WRITING_THEIR_WHOLE_OBJECT_RECORD.has(
        String(step.type),
      ) ||
      !isPlainObject(step.settings) ||
      !isPlainObject(step.settings.input) ||
      !('fieldsToUpdate' in step.settings.input)
    ) {
      return step;
    }

    const { fieldsToUpdate, ...inputWithoutFieldsToUpdate } =
      step.settings.input;

    if (!Array.isArray(fieldsToUpdate) || fieldsToUpdate.length > 0) {
      droppedNonEmptyFieldsToUpdate.push({ stepId: step.id, fieldsToUpdate });
    }

    hasChanged = true;

    return {
      ...step,
      settings: { ...step.settings, input: inputWithoutFieldsToUpdate },
    };
  });

  return {
    steps: hasChanged ? updatedSteps : steps,
    hasChanged,
    droppedNonEmptyFieldsToUpdate,
  };
};
