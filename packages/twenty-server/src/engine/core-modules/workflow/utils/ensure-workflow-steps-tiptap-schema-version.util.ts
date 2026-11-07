import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { ensureTipTapSchemaVersion } from 'src/engine/core-modules/record-transformer/utils/ensure-tiptap-schema-version.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const ensureFieldValueTipTapSchemaVersion = (value: unknown): unknown =>
  isPlainObject(value) && isNonEmptyString(value.tiptap)
    ? { ...value, tiptap: ensureTipTapSchemaVersion(value.tiptap) }
    : value;

const ensureStepTipTapSchemaVersion = (
  step: WorkflowAction,
): WorkflowAction => {
  switch (step.type) {
    case WorkflowActionType.CREATE_RECORD:
    case WorkflowActionType.UPDATE_RECORD:
    case WorkflowActionType.UPSERT_RECORD: {
      const objectRecord: unknown = step.settings?.input?.objectRecord;

      if (!isPlainObject(objectRecord)) {
        return step;
      }

      const versionedObjectRecord = Object.fromEntries(
        Object.entries(objectRecord).map(([fieldName, value]) => [
          fieldName,
          ensureFieldValueTipTapSchemaVersion(value),
        ]),
      );

      return {
        ...step,
        settings: {
          ...step.settings,
          input: {
            ...step.settings.input,
            objectRecord: versionedObjectRecord,
          },
        },
      } as WorkflowAction;
    }
    default:
      return step;
  }
};

export const ensureWorkflowStepsTipTapSchemaVersion = (
  steps: WorkflowAction[] | null,
): WorkflowAction[] | null =>
  Array.isArray(steps) ? steps.map(ensureStepTipTapSchemaVersion) : steps;
