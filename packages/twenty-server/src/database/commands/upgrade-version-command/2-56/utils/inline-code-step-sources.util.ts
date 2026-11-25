import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';

export const UNRECOVERABLE_CODE_STEP_SOURCE = `export const main = async () => {
  throw new Error('The source of this code step could not be recovered during the upgrade; rewrite it.');
};
`;

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

// logicFunctionId stays for rollback; only a step whose function is gone gets the stub
export const inlineCodeStepSources = ({
  steps,
  sourceByLogicFunctionId,
  existingLogicFunctionIds,
}: {
  steps: StoredWorkflowStep[];
  sourceByLogicFunctionId: ReadonlyMap<string, string>;
  existingLogicFunctionIds: ReadonlySet<string>;
}): { steps: StoredWorkflowStep[]; inlinedCodeSteps: InlinedCodeStep[] } => {
  const inlinedCodeSteps: InlinedCodeStep[] = [];

  const rewrittenSteps = steps.map((step) => {
    const logicFunctionId = getLegacyCodeStepLogicFunctionId(step);

    if (!isDefined(logicFunctionId)) {
      return step;
    }

    const source = sourceByLogicFunctionId.get(logicFunctionId);

    if (!isDefined(source) && existingLogicFunctionIds.has(logicFunctionId)) {
      return step;
    }

    inlinedCodeSteps.push({ stepId: step.id, logicFunctionId });

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings?.input,
          code: source ?? UNRECOVERABLE_CODE_STEP_SOURCE,
        },
      },
    };
  });

  return { steps: rewrittenSteps, inlinedCodeSteps };
};
