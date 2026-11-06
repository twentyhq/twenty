import { isPlainObject } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const dropStepLegacyEmptyFieldsToUpdate = (
  step: WorkflowAction,
): WorkflowAction => {
  if (
    step.type !== WorkflowActionType.CREATE_RECORD &&
    step.type !== WorkflowActionType.UPSERT_RECORD
  ) {
    return step;
  }

  const input: unknown = step.settings?.input;

  if (
    !isPlainObject(input) ||
    !Array.isArray(input.fieldsToUpdate) ||
    input.fieldsToUpdate.length > 0
  ) {
    return step;
  }

  const { fieldsToUpdate: _fieldsToUpdate, ...inputWithoutFieldsToUpdate } =
    input;

  return {
    ...step,
    settings: { ...step.settings, input: inputWithoutFieldsToUpdate },
  } as WorkflowAction;
};

// The builder gave UPSERT_RECORD an empty fieldsToUpdate until upgrade:2-57:drop-fields-to-update-from-create-and-upsert-records;
// remove once 2.57 leaves the cross-upgrade window
export const dropLegacyEmptyFieldsToUpdate = (
  steps: WorkflowAction[] | null,
): WorkflowAction[] | null =>
  Array.isArray(steps) ? steps.map(dropStepLegacyEmptyFieldsToUpdate) : steps;
