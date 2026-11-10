import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';
import { useUpdateWorkflowVersionPositions } from '@/workflow/workflow-version/hooks/useUpdateWorkflowVersionPositions';

export const useTidyUpWorkflowVersion = (instanceId?: string) => {
  const { updateWorkflowVersionPositions } =
    useUpdateWorkflowVersionPositions(instanceId);

  const tidyUpWorkflowVersion = async (workflowDiagram: WorkflowDiagram) => {
    const tidiedUpDiagram = getOrganizedDiagram(workflowDiagram);

    await updateWorkflowVersionPositions(
      tidiedUpDiagram.nodes.map((node) => ({
        id: node.id,
        position: node.position,
      })),
    );

    return tidiedUpDiagram;
  };

  return { tidyUpWorkflowVersion };
};
