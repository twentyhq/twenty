import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { UNRECOVERABLE_CODE_STEP_SOURCE } from 'src/database/commands/upgrade-version-command/2-56/utils/inline-code-step-sources.util';
import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';

export type CodeStepLogicFunctionReference = {
  stepId: unknown;
  logicFunctionId: string;
};

// a CODE step without code still runs from its function, so it keeps the reference while the function exists
export const dropInlinedCodeStepLogicFunctionIds = ({
  steps,
  existingLogicFunctionIds,
}: {
  steps: StoredWorkflowStep[];
  existingLogicFunctionIds: ReadonlySet<string>;
}): {
  steps: StoredWorkflowStep[];
  droppedReferences: CodeStepLogicFunctionReference[];
  stubbedReferences: CodeStepLogicFunctionReference[];
  codelessReferences: CodeStepLogicFunctionReference[];
} => {
  const droppedReferences: CodeStepLogicFunctionReference[] = [];
  const stubbedReferences: CodeStepLogicFunctionReference[] = [];
  const codelessReferences: CodeStepLogicFunctionReference[] = [];

  const rewrittenSteps = steps.map((step) => {
    const input = step.settings?.input;

    if (
      step.type !== 'CODE' ||
      !isDefined(input) ||
      !isString(input.logicFunctionId)
    ) {
      return step;
    }

    const { logicFunctionId, ...inputWithoutLogicFunctionId } = input;
    const reference = { stepId: step.id, logicFunctionId };

    if (isNonEmptyString(input.code)) {
      droppedReferences.push(reference);

      return {
        ...step,
        settings: { ...step.settings, input: inputWithoutLogicFunctionId },
      };
    }

    if (existingLogicFunctionIds.has(logicFunctionId)) {
      codelessReferences.push(reference);

      return step;
    }

    stubbedReferences.push(reference);

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...inputWithoutLogicFunctionId,
          code: UNRECOVERABLE_CODE_STEP_SOURCE,
        },
      },
    };
  });

  return {
    steps: rewrittenSteps,
    droppedReferences,
    stubbedReferences,
    codelessReferences,
  };
};
