import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import { getWorkflowVersionDiagram } from '@/workflow/utils/getWorkflowVersionDiagram';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowVersionVisualizerEffect = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      setWorkflowDiagram(undefined);

      return;
    }

    const nextWorkflowDiagram = getWorkflowVersionDiagram(workflowVersion);

    setWorkflowDiagram(nextWorkflowDiagram);
  }, [setWorkflowDiagram, workflowVersion]);

  return null;
};
