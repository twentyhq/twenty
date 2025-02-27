import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useWorkflowSelectedNodeOrThrow = () => {
  const workflowSelectedNode = useRecoilValue(workflowSelectedNodeState);

  if (!isDefined(workflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. A node must have been selected before running this code.',
    );
  }

  return workflowSelectedNode;
};
