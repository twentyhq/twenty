import { isNonEmptyString } from '@sniptt/guards';
import { richTextValueSchema } from 'twenty-shared/types';
import {
  convertTipTapBlocksToDocument,
  isDefined,
  isPlainObject,
  TIPTAP_DOCUMENT_SCHEMA_VERSION,
} from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const convertRichTextValue = (value: unknown): unknown => {
  const parsedValue = richTextValueSchema.safeParse(value);

  if (
    !parsedValue.success ||
    isNonEmptyString(parsedValue.data.tiptap) ||
    !isNonEmptyString(parsedValue.data.blocknote)
  ) {
    return value;
  }

  const document = convertTipTapBlocksToDocument(parsedValue.data.blocknote);

  if (!isDefined(document)) {
    return value;
  }

  return {
    ...parsedValue.data,
    tiptap: JSON.stringify({
      ...document,
      attrs: {
        ...document.attrs,
        schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION,
      },
    }),
  };
};

const convertRecordStepRichTextValues = (
  step: WorkflowAction,
): WorkflowAction => {
  if (
    step.type !== WorkflowActionType.CREATE_RECORD &&
    step.type !== WorkflowActionType.UPDATE_RECORD &&
    step.type !== WorkflowActionType.UPSERT_RECORD
  ) {
    return step;
  }

  const objectRecord: unknown = step.settings?.input?.objectRecord;

  if (!isPlainObject(objectRecord)) {
    return step;
  }

  const convertedEntries = Object.entries(objectRecord).map(
    ([fieldName, value]) => [fieldName, convertRichTextValue(value)] as const,
  );

  if (
    convertedEntries.every(
      ([fieldName, value]) => value === objectRecord[fieldName],
    )
  ) {
    return step;
  }

  return {
    ...step,
    settings: {
      ...step.settings,
      input: {
        ...step.settings.input,
        objectRecord: Object.fromEntries(convertedEntries),
      },
    },
  } as WorkflowAction;
};

export const convertWorkflowRichTextStepsToTiptap = (
  steps: WorkflowAction[] | null,
): { value: WorkflowAction[] | null; hasChanged: boolean } => {
  if (!Array.isArray(steps)) {
    return { value: steps, hasChanged: false };
  }

  const convertedSteps = steps.map(convertRecordStepRichTextValues);
  const hasChanged = convertedSteps.some(
    (convertedStep, index) => convertedStep !== steps[index],
  );

  return { value: hasChanged ? convertedSteps : steps, hasChanged };
};
