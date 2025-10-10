import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';
import { isDefined } from 'twenty-shared/utils';
import { useTidyUpWorkflowVersion } from './useTidyUpWorkflowVersion';

export const useTidyUp = () => {
  const workflowDiagram = useRecoilComponentValue(
    workflowDiagramComponentState,
  );
  const setWorkflowDiagram = useSetRecoilComponentState(
    workflowDiagramComponentState,
  );

  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion();

  const tidyUp = async () => {
    if (!isDefined(workflowDiagram)) {
      return;
    }

    const tidiedUpDiagram = getOrganizedDiagram(workflowDiagram);

    const positions = tidiedUpDiagram.nodes.map((node) => ({
      id: node.id,
      position: node.position,
    }));

    await tidyUpWorkflowVersion(tidiedUpDiagram, positions);

    setWorkflowDiagram(tidiedUpDiagram);
  };

  return { tidyUp };
};
