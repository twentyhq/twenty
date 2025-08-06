import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { useEffect } from 'react';

export const WorkflowVisualizerEffect = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const setWorkflowVisualizerWorkflowId = useSetRecoilComponentState(
    workflowVisualizerWorkflowIdComponentState,
  );

  useEffect(() => {
    setWorkflowVisualizerWorkflowId(workflowId);
  }, [setWorkflowVisualizerWorkflowId, workflowId]);

  return null;
};
