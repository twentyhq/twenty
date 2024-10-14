import { workflowIdState } from '@/workflow/states/workflowIdState';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export const WorkflowVisualizerEffect = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const setWorkflowId = useSetRecoilState(workflowIdState);

  useEffect(() => {
    setWorkflowId(workflowId);
  }, [setWorkflowId, workflowId]);

  return null;
};
