import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  convertEmailBodyToEmailDocument,
  parseCanonicalEmailDocument,
  parseJson,
} from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const convertBodyToEmailDocumentJson = (body: unknown): string | undefined => {
  if (
    !isString(body) ||
    !isNonEmptyString(body.trim()) ||
    parseCanonicalEmailDocument(parseJson<unknown>(body)).success
  ) {
    return undefined;
  }

  const conversionResult = convertEmailBodyToEmailDocument(body);

  return conversionResult.success
    ? JSON.stringify(conversionResult.document)
    : undefined;
};

const convertEmailStepBody = (step: WorkflowAction): WorkflowAction => {
  if (
    step.type !== WorkflowActionType.SEND_EMAIL &&
    step.type !== WorkflowActionType.DRAFT_EMAIL
  ) {
    return step;
  }

  const convertedBody = convertBodyToEmailDocumentJson(
    step.settings?.input?.body,
  );

  if (convertedBody === undefined) {
    return step;
  }

  return {
    ...step,
    settings: {
      ...step.settings,
      input: { ...step.settings.input, body: convertedBody },
    },
  };
};

export const convertWorkflowEmailBodiesToEmailDocuments = (
  steps: WorkflowAction[] | null,
): { value: WorkflowAction[] | null; hasChanged: boolean } => {
  if (!Array.isArray(steps)) {
    return { value: steps, hasChanged: false };
  }

  const convertedSteps = steps.map(convertEmailStepBody);
  const hasChanged = convertedSteps.some(
    (convertedStep, index) => convertedStep !== steps[index],
  );

  return { value: hasChanged ? convertedSteps : steps, hasChanged };
};
