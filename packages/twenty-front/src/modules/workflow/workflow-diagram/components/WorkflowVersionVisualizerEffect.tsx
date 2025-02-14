import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { workflowVersionIdState } from '@/workflow/states/workflowVersionIdState';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
import { getWorkflowVersionDiagram } from '@/workflow/workflow-diagram/utils/getWorkflowVersionDiagram';
import { markLeafNodes } from '@/workflow/workflow-diagram/utils/markLeafNodes';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';

export const WorkflowVersionVisualizerEffect = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  const setWorkflowVersionId = useSetRecoilState(workflowVersionIdState);
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  useEffect(() => {
    setWorkflowVersionId(workflowVersionId);
  }, [setWorkflowVersionId, workflowVersionId]);

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      setWorkflowDiagram(undefined);

      return;
    }

    const nextWorkflowDiagram = markLeafNodes(
      getWorkflowVersionDiagram(workflowVersion),
    );

    setWorkflowDiagram(nextWorkflowDiagram);
  }, [setWorkflowDiagram, workflowVersion]);

  return null;
};
