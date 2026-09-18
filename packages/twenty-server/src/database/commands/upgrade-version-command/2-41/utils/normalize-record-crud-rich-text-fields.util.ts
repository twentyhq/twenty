import { isNonEmptyArray, isString } from '@sniptt/guards';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { z } from 'zod';

const recordCrudStepSchema = z.object({
  type: z.enum([
    WorkflowActionType.CREATE_RECORD,
    WorkflowActionType.UPDATE_RECORD,
    WorkflowActionType.UPSERT_RECORD,
  ]),
  settings: z.object({
    input: z.object({
      objectName: z.string(),
      objectRecord: z.record(z.string(), z.unknown()),
    }),
  }),
});

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
    const parsedStep = recordCrudStepSchema.safeParse(step);

    if (!parsedStep.success) {
      return step;
    }

    const { objectName, objectRecord } = parsedStep.data.settings.input;
    const richTextFieldNames = richTextFieldNamesByObjectName[objectName];

    if (!isNonEmptyArray(richTextFieldNames)) {
      return step;
    }

    isRecordCrudRichTextCandidate = true;

    let hasStepChanged = false;
    const nextObjectRecord: Record<string, unknown> = { ...objectRecord };

    for (const fieldName of richTextFieldNames) {
      const value = nextObjectRecord[fieldName];

      if (isString(value)) {
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
        ...step.settings,
        input: { ...step.settings.input, objectRecord: nextObjectRecord },
      },
    };
  });

  return {
    value: hasChanged ? (nextSteps as TSteps) : steps,
    hasChanged,
    isRecordCrudRichTextCandidate,
  };
};
