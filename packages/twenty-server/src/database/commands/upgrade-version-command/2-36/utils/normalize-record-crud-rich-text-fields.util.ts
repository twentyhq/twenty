import { isObject } from '@sniptt/guards';
import { WorkflowActionType } from 'twenty-shared/workflow';

const RECORD_CRUD_ACTION_TYPES_WITH_OBJECT_RECORD = new Set<string>([
  WorkflowActionType.CREATE_RECORD,
  WorkflowActionType.UPDATE_RECORD,
  WorkflowActionType.UPSERT_RECORD,
]);

// A rich text field value must be the { blocknote, markdown } object shape. Legacy
// programmatically-authored workflows stored a bare string, which crashes the
// executor. Wrap it as markdown; the record write layer derives blocknote from it.
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

    if (richTextFieldNames === undefined || richTextFieldNames.length === 0) {
      return step;
    }

    let stepChanged = false;
    const nextObjectRecord: Record<string, unknown> = { ...objectRecord };

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

    return {
      ...step,
      settings: {
        ...settings,
        input: { ...input, objectRecord: nextObjectRecord },
      },
    };
  });

  return changed ? { value: nextSteps, changed } : { value: steps, changed };
};
