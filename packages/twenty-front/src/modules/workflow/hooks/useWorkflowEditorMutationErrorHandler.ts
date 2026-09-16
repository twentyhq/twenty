import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';

export const useWorkflowEditorMutationErrorHandler = (instanceId?: string) => {
  const store = useStore();
  const { enqueueErrorSnackBar } = useSnackBar();
  const flowState = useAtomComponentStateCallbackState(
    flowComponentState,
    instanceId,
  );
  const diagramState = useAtomComponentStateCallbackState(
    workflowDiagramComponentState,
    instanceId,
  );

  return (error: Error) => {
    enqueueErrorSnackBar({ apolloError: error });
    const flow = store.get(flowState);
    if (isDefined(flow)) {
      store.set(
        diagramState,
        generateWorkflowDiagram({
          trigger: flow.trigger ?? undefined,
          steps: flow.steps ?? [],
          workflowContext: 'workflow',
        }),
      );
    }
  };
};
