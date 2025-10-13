import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';

export const useTidyUp = () => {
  const [workflowDiagram, setWorkflowDiagram] = useRecoilComponentState(
    workflowDiagramComponentState,
  );

  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion();

  const tidyUp = async () => {
    if (!isDefined(workflowDiagram)) {
      return;
    }

    const tidiedUpDiagram = await tidyUpWorkflowVersion(workflowDiagram);

    if (isDefined(tidiedUpDiagram)) {
      setWorkflowDiagram(tidiedUpDiagram);
    }
  };

  return { tidyUp };
};
