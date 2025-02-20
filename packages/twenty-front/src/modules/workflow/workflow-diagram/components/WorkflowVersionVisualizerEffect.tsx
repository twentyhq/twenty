import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowState } from '@/workflow/states/flowState';
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

  const setFlow = useSetRecoilState(flowState);
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      setFlow(undefined);

      return;
    }

    setFlow({
      trigger: workflowVersion.trigger,
      steps: workflowVersion.steps,
    });
  }, [setFlow, workflowVersion]);

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
