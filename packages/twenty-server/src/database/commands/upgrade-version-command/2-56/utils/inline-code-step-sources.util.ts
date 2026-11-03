import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';

const getLegacyCodeStepLogicFunctionId = (
  step: StoredWorkflowStep,
): string | undefined => {
  const input = step.settings?.input;

  return step.type === 'CODE' &&
    isDefined(input) &&
    !isString(input.code) &&
    isString(input.logicFunctionId)
    ? input.logicFunctionId
    : undefined;
};

export const inlineCodeStepSources = ({
  steps,
  sourceByLogicFunctionId,
}: {
  steps: StoredWorkflowStep[];
  sourceByLogicFunctionId: ReadonlyMap<string, string>;
}): { steps: StoredWorkflowStep[]; hasChanged: boolean } => {
  let hasChanged = false;

  const rewrittenSteps = steps.map((step) => {
    const logicFunctionId = getLegacyCodeStepLogicFunctionId(step);
    const code = isDefined(logicFunctionId)
      ? sourceByLogicFunctionId.get(logicFunctionId)
      : undefined;

    if (!isDefined(code)) {
      return step;
    }

    hasChanged = true;

    const { logicFunctionId: _logicFunctionId, ...input } =
      step.settings?.input ?? {};

    return {
      ...step,
      settings: { ...step.settings, input: { ...input, code } },
    };
  });

  return { steps: rewrittenSteps, hasChanged };
};
