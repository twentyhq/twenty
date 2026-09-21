import {
  getWorkflowReconnectionForbiddenTargetStepIds,
  type WorkflowFlow,
} from '@/workflow/workflow-diagram/utils/getWorkflowReconnectionForbiddenTargetStepIds';

export const wouldReconnectWorkflowEdgeCreateCycle = ({
  flow,
  sourceStepId,
  targetStepId,
}: {
  flow: WorkflowFlow;
  sourceStepId: string;
  targetStepId: string;
}): boolean => {
  return getWorkflowReconnectionForbiddenTargetStepIds({
    flow,
    sourceStepId,
  }).has(targetStepId);
};
