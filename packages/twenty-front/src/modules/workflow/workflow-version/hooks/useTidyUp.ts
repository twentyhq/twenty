import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';

export const useTidyUp = () => {
  const workflowDiagram = useAtomComponentStateValue(
    workflowDiagramComponentState,
  );

  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion();

  const tidyUp = async () => {
    if (!isDefined(workflowDiagram)) {
      return;
    }

    await tidyUpWorkflowVersion(workflowDiagram);
  };

  return { tidyUp };
};
