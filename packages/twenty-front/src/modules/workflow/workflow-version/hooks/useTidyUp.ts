import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';

export const useTidyUp = ({
  workflow,
}: {
  workflow?: WorkflowWithCurrentVersion;
}) => {
  const [workflowDiagram, setWorkflowDiagram] = useRecoilComponentStateV2(
    workflowDiagramComponentState,
  );

  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion({ workflow });

  const tidyUp = async () => {
    if (!isDefined(workflowDiagram) || !isDefined(workflow?.currentVersion)) {
      return;
    }

    const tidiedUpDiagram = getOrganizedDiagram(workflowDiagram);

    const positions = tidiedUpDiagram.nodes.map((node) => ({
      id: node.id,
      position: node.position,
    }));

    await tidyUpWorkflowVersion(positions);

    setWorkflowDiagram(tidiedUpDiagram);
  };

  return { tidyUp };
};
