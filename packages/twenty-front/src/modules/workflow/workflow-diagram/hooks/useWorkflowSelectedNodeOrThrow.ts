import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowSelectedNodeOrThrow = () => {
  const workflowSelectedNode = useRecoilComponentValue(
    workflowSelectedNodeComponentState,
  );

  if (!isDefined(workflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. A node must have been selected before running this code.',
    );
  }

  return workflowSelectedNode;
};
