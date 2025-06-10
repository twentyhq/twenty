import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowSelectedNodeOrThrow = () => {
  const workflowSelectedNode = useRecoilComponentValueV2(
    workflowSelectedNodeComponentState,
  );

  if (!isDefined(workflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. A node must have been selected before running this code.',
    );
  }

  return workflowSelectedNode;
};
