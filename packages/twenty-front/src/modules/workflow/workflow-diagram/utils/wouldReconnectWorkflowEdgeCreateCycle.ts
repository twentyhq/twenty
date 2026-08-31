import { buildWorkflowGraph } from 'twenty-shared/workflow';

export const wouldReconnectWorkflowEdgeCreateCycle = ({
  flow,
  sourceStepId,
  targetStepId,
}: {
  flow: Parameters<typeof buildWorkflowGraph>[0];
  sourceStepId: string;
  targetStepId: string;
}): boolean => {
  const { ancestorsByStepId } = buildWorkflowGraph(flow);

  return ancestorsByStepId.get(sourceStepId)?.has(targetStepId) === true;
};
