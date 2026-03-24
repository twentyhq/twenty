import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { workflowRunCallsFamilyState } from '@/command-menu-item/engine-command/states/workflowRunCallsFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useCallback } from 'react';

export const RunWorkflowEngineCommand = () => {
  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );

  const workflowRunCalls = useAtomFamilyStateValue(
    workflowRunCallsFamilyState,
    engineCommandId,
  );

  const setWorkflowRunCalls = useSetAtomFamilyState(
    workflowRunCallsFamilyState,
    engineCommandId,
  );

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const execute = useCallback(async () => {
    for (const call of workflowRunCalls) {
      await runWorkflowVersion({
        workflowId: call.workflowId,
        workflowVersionId: call.workflowVersionId,
        payload: call.payload,
      });
    }

    setWorkflowRunCalls([]);
  }, [workflowRunCalls, runWorkflowVersion, setWorkflowRunCalls]);

  return <HeadlessEngineCommandWrapperEffect execute={execute} />;
};
