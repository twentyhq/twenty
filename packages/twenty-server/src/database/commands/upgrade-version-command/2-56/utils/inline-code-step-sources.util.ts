import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';

const buildThrowingCode = (errorMessage: string) =>
  `export const main = async () => {
  throw new Error('${errorMessage}');
};
`;

export const UNRECOVERABLE_CODE_STEP_SOURCE = buildThrowingCode(
  'The source of this code step could not be recovered during the upgrade; rewrite it.',
);

export const OVERSIZED_CODE_STEP_SOURCE = buildThrowingCode(
  'The source of this code step exceeded the size limit during the upgrade; rewrite it.',
);

export type InlinedCodeStep = {
  stepId: unknown;
  logicFunctionId: string;
};

const getLegacyCodeStepLogicFunctionId = (
  step: StoredWorkflowStep,
): string | undefined => {
  const input = step.settings?.input;

  if (step.type !== 'CODE' || !isDefined(input)) {
    return undefined;
  }

  if (isNonEmptyString(input.code) || !isString(input.logicFunctionId)) {
    return undefined;
  }

  return input.logicFunctionId;
};

export const inlineCodeStepSources = ({
  steps,
  sourceByLogicFunctionId,
}: {
  steps: StoredWorkflowStep[];
  sourceByLogicFunctionId: ReadonlyMap<string, string>;
}): { steps: StoredWorkflowStep[]; inlinedCodeSteps: InlinedCodeStep[] } => {
  const inlinedCodeSteps: InlinedCodeStep[] = [];

  const rewrittenSteps = steps.map((step) => {
    const logicFunctionId = getLegacyCodeStepLogicFunctionId(step);

    if (!isDefined(logicFunctionId)) {
      return step;
    }

    inlinedCodeSteps.push({ stepId: step.id, logicFunctionId });

    const { logicFunctionId: _logicFunctionId, ...input } =
      step.settings?.input ?? {};
    const code =
      sourceByLogicFunctionId.get(logicFunctionId) ??
      UNRECOVERABLE_CODE_STEP_SOURCE;

    return {
      ...step,
      settings: { ...step.settings, input: { ...input, code } },
    };
  });

  return { steps: rewrittenSteps, inlinedCodeSteps };
};
