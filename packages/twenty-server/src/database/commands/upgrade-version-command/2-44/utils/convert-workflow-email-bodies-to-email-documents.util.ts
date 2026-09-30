import { isNonEmptyString } from '@sniptt/guards';
import {
  parseCanonicalEmailDocument,
  parseEmailBodyAsEmailDocument,
  parseJson,
} from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { z } from 'zod';

const emailStepSchema = z.object({
  type: z.enum([WorkflowActionType.SEND_EMAIL, WorkflowActionType.DRAFT_EMAIL]),
  settings: z.object({
    input: z.object({ body: z.string() }),
  }),
});

const convertBodyToEmailDocumentJson = (body: string): string | undefined => {
  if (
    !isNonEmptyString(body.trim()) ||
    parseCanonicalEmailDocument(parseJson<unknown>(body)).success
  ) {
    return undefined;
  }

  const parseResult = parseEmailBodyAsEmailDocument(body);

  return parseResult.success ? JSON.stringify(parseResult.document) : undefined;
};

export const convertWorkflowEmailBodiesToEmailDocuments = <TSteps>(
  steps: TSteps,
): { value: TSteps; hasChanged: boolean } => {
  if (!Array.isArray(steps)) {
    return { value: steps, hasChanged: false };
  }

  let hasChanged = false;

  const nextSteps = steps.map((step) => {
    const parsedStep = emailStepSchema.safeParse(step);

    if (!parsedStep.success) {
      return step;
    }

    const convertedBody = convertBodyToEmailDocumentJson(
      parsedStep.data.settings.input.body,
    );

    if (convertedBody === undefined) {
      return step;
    }

    hasChanged = true;

    return {
      ...step,
      settings: {
        ...step.settings,
        input: { ...step.settings.input, body: convertedBody },
      },
    };
  });

  return { value: hasChanged ? (nextSteps as TSteps) : steps, hasChanged };
};
