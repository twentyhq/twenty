import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';

export const useTidyUp = () => {
  const [workflowDiagram, setWorkflowDiagram] = useAtomComponentState(
    workflowDiagramComponentState,
  );

  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion();

  const tidyUp = async () => {
    if (!isDefined(workflowDiagram)) {
      return;
    }

    setWorkflowDiagram(await tidyUpWorkflowVersion(workflowDiagram));
  };

  return { tidyUp };
};
