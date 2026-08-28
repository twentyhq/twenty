import { isNonEmptyArray, isObject } from '@sniptt/guards';
import { WorkflowActionType } from 'twenty-shared/workflow';

const RECORD_CRUD_ACTION_TYPES_WITH_OBJECT_RECORD = new Set<string>([
  WorkflowActionType.CREATE_RECORD,
  WorkflowActionType.UPDATE_RECORD,
  WorkflowActionType.UPSERT_RECORD,
]);

export const normalizeRecordCrudRichTextFieldsInSteps = <TSteps>({
  steps,
  richTextFieldNamesByObjectName,
}: {
  steps: TSteps;
  richTextFieldNamesByObjectName: Record<string, string[]>;
}): {
  value: TSteps;
  hasChanged: boolean;
  isRecordCrudRichTextCandidate: boolean;
} => {
  if (!Array.isArray(steps)) {
    return {
      value: steps,
      hasChanged: false,
      isRecordCrudRichTextCandidate: false,
    };
  }

  let hasChanged = false;
  let isRecordCrudRichTextCandidate = false;

  const nextSteps = steps.map((step) => {
    if (
      !isObject(step) ||
      typeof step.type !== 'string' ||
      !RECORD_CRUD_ACTION_TYPES_WITH_OBJECT_RECORD.has(step.type)
    ) {
      return step;
    }

    const settings = step.settings;
    const input =
      isObject(settings) && 'input' in settings ? settings.input : undefined;

    if (!isObject(input)) {
      return step;
    }

    const objectName = 'objectName' in input ? input.objectName : undefined;
    const objectRecord =
      'objectRecord' in input ? input.objectRecord : undefined;

    if (typeof objectName !== 'string' || !isObject(objectRecord)) {
      return step;
    }

    const richTextFieldNames = richTextFieldNamesByObjectName[objectName];

    if (!isNonEmptyArray(richTextFieldNames)) {
      return step;
    }

    isRecordCrudRichTextCandidate = true;

    let hasStepChanged = false;
    const nextObjectRecord: Record<string, unknown> = { ...objectRecord };

    for (const fieldName of richTextFieldNames) {
      const value = nextObjectRecord[fieldName];

      if (typeof value === 'string') {
        nextObjectRecord[fieldName] = { blocknote: null, markdown: value };
        hasStepChanged = true;
      }
    }

    if (!hasStepChanged) {
      return step;
    }

    hasChanged = true;

    return {
      ...step,
      settings: {
        ...settings,
        input: { ...input, objectRecord: nextObjectRecord },
      },
    };
  });

  return {
    value: hasChanged ? (nextSteps as TSteps) : steps,
    hasChanged,
    isRecordCrudRichTextCandidate,
  };
};
