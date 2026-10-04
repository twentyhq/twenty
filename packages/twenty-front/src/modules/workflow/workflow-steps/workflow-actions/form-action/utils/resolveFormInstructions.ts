import { isString } from '@sniptt/guards';
import { isDefined, resolveInput } from 'twenty-shared/utils';
import {
  getWorkflowRunContext,
  type WorkflowRunStepInfos,
} from 'twenty-shared/workflow';

export const resolveFormInstructions = ({
  instructions,
  stepInfos,
}: {
  instructions: string | undefined;
  stepInfos: WorkflowRunStepInfos | undefined;
}): string | undefined => {
  if (!isDefined(instructions) || instructions.trim() === '') {
    return undefined;
  }

  const resolvedInstructions = resolveInput(
    instructions,
    getWorkflowRunContext(stepInfos ?? {}),
  );

  // a lone variable resolves to the value itself, which may not be text
  return isString(resolvedInstructions)
    ? resolvedInstructions
    : JSON.stringify(resolvedInstructions);
};
