import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedCommandState } from '@/command-menu-item/engine-command/hooks/useMountedCommandState';
import { isMountedTriggerWorkflowVersionCommandState } from '@/command-menu-item/engine-command/utils/isMountedTriggerWorkflowVersionCommandState';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useCallback } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const TriggerWorkflowVersionEngineCommand = () => {
  const mountedCommandState = useMountedCommandState();

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const execute = useCallback(async () => {
    if (!isMountedTriggerWorkflowVersionCommandState(mountedCommandState)) {
      return;
    }

    if (!isNonEmptyArray(mountedCommandState.payloads)) {
      await runWorkflowVersion({
        workflowId: mountedCommandState.workflowId,
        workflowVersionId: mountedCommandState.workflowVersionId,
      });

      return;
    }

    for (const payload of mountedCommandState.payloads) {
      await runWorkflowVersion({
        workflowId: mountedCommandState.workflowId,
        workflowVersionId: mountedCommandState.workflowVersionId,
        payload,
      });
    }
  }, [runWorkflowVersion, mountedCommandState]);

  return <HeadlessEngineCommandWrapperEffect execute={execute} />;
};
