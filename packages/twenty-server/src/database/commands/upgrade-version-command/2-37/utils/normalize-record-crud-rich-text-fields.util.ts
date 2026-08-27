import { getRecordCrudStepObjectRecord } from 'src/modules/workflow/common/utils/get-record-crud-step-object-record.util';

export const normalizeRecordCrudRichTextFieldsInSteps = ({
  steps,
  richTextFieldNamesByObjectName,
}: {
  steps: unknown;
  richTextFieldNamesByObjectName: Record<string, string[]>;
}): { value: unknown; changed: boolean } => {
  if (!Array.isArray(steps)) {
    return { value: steps, changed: false };
  }

  let changed = false;

  const nextSteps = steps.map((step) => {
    const parsed = getRecordCrudStepObjectRecord(step);

    if (parsed === undefined) {
      return step;
    }

    const richTextFieldNames = richTextFieldNamesByObjectName[parsed.objectName];

    if (richTextFieldNames === undefined || richTextFieldNames.length === 0) {
      return step;
    }

    let stepChanged = false;
    const nextObjectRecord: Record<string, unknown> = { ...parsed.objectRecord };

    for (const fieldName of richTextFieldNames) {
      const value = nextObjectRecord[fieldName];

      if (typeof value === 'string') {
        nextObjectRecord[fieldName] = { blocknote: null, markdown: value };
        stepChanged = true;
      }
    }

    if (!stepChanged) {
      return step;
    }

    changed = true;

    const typedStep = step as { settings: { input: Record<string, unknown> } };

    return {
      ...typedStep,
      settings: {
        ...typedStep.settings,
        input: { ...typedStep.settings.input, objectRecord: nextObjectRecord },
      },
    };
  });

  return changed ? { value: nextSteps, changed } : { value: steps, changed };
};
