import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowVisualizerEffect = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const setWorkflowVisualizerWorkflowId = useSetRecoilComponentState(
    workflowVisualizerWorkflowIdComponentState,
  );
  const setWorkflowVisualizerWorkflowVersionId = useSetRecoilComponentState(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  const workflow = useWorkflowWithCurrentVersion(workflowId);

  useEffect(() => {
    setWorkflowVisualizerWorkflowId(workflowId);
  }, [setWorkflowVisualizerWorkflowId, workflowId]);

  useEffect(() => {
    if (isDefined(workflow)) {
      setWorkflowVisualizerWorkflowVersionId(workflow.currentVersion.id);
    }
  }, [setWorkflowVisualizerWorkflowVersionId, workflow]);

  return null;
};
