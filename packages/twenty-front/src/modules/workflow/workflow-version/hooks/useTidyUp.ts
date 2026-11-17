import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useTidyUp = () => {
  const store = useStore();

  const workflowDiagramState = useAtomComponentStateCallbackState(
    workflowDiagramComponentState,
  );

  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion();

  const tidyUp = async () => {
    const workflowDiagram = store.get(workflowDiagramState);

    if (!isDefined(workflowDiagram)) {
      return;
    }

    await tidyUpWorkflowVersion(workflowDiagram);
  };

  return { tidyUp };
};
