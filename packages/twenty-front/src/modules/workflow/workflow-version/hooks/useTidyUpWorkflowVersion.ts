import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';
import { useUpdateWorkflowVersionPositions } from '@/workflow/workflow-version/hooks/useUpdateWorkflowVersionPositions';

export const useTidyUpWorkflowVersion = (instanceId?: string) => {
  const setWorkflowDiagram = useSetAtomComponentState(
    workflowDiagramComponentState,
    instanceId,
  );
  const { updateWorkflowVersionPositions } =
    useUpdateWorkflowVersionPositions(instanceId);

  const tidyUpWorkflowVersion = async (workflowDiagram: WorkflowDiagram) => {
    const tidiedUpDiagram = getOrganizedDiagram(workflowDiagram);

    setWorkflowDiagram(tidiedUpDiagram);

    try {
      await updateWorkflowVersionPositions(
        tidiedUpDiagram.nodes.map((node) => ({ id: node.id, position: null })),
      );
    } catch (error) {
      setWorkflowDiagram(workflowDiagram);

      throw error;
    }
  };

  return { tidyUpWorkflowVersion };
};
