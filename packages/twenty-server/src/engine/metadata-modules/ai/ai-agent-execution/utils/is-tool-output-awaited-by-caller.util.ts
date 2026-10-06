import { isDefined } from 'twenty-shared/utils';

import { type AgentRunCallerFilter } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { readToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-history/utils/read-tool-call-workflow-step.util';

export const isToolOutputAwaitedByCaller = ({
  toolOutput,
  caller,
}: {
  toolOutput: unknown;
  caller: AgentRunCallerFilter;
}): boolean => {
  const workflowStep = readToolCallWorkflowStep(toolOutput);

  if (!isDefined(workflowStep) || caller.type !== 'WORKFLOW_STEP') {
    return false;
  }

  return (
    (!isDefined(caller.ref.workflowRunId) ||
      caller.ref.workflowRunId === workflowStep.workflowRunId) &&
    (!isDefined(caller.ref.stepId) || caller.ref.stepId === workflowStep.stepId)
  );
};
