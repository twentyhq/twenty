import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowRunIdOrThrow = () => {
  const workflowVisualizerWorkflowRunId = useAtomComponentStateValue(
    workflowVisualizerWorkflowRunIdComponentState,
  );

  if (!isDefined(workflowVisualizerWorkflowRunId)) {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
    throw new Error('Expected the workflow run ID to be defined');
  }

  return workflowVisualizerWorkflowRunId;
};
