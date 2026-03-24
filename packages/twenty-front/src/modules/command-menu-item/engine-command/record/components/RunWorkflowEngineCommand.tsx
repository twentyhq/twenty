import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useMountedCommandState } from '@/command-menu-item/engine-command/hooks/useMountedCommandState';
import { isMountedTriggerWorkflowVersionCommandState } from '@/command-menu-item/engine-command/utils/isMountedTriggerWorkflowVersionCommandState';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useCallback } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const RunWorkflowEngineCommand = () => {
  const context = useMountedCommandState();

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const execute = useCallback(async () => {
    if (!isMountedTriggerWorkflowVersionCommandState(context)) {
      return;
    }

    if (!isNonEmptyArray(context.payloads)) {
      await runWorkflowVersion({
        workflowId: context.workflowId,
        workflowVersionId: context.workflowVersionId,
      });

      return;
    }

    for (const payload of context.payloads) {
      await runWorkflowVersion({
        workflowId: context.workflowId,
        workflowVersionId: context.workflowVersionId,
        payload,
      });
    }
  }, [context, runWorkflowVersion]);

  return <HeadlessEngineCommandWrapperEffect execute={execute} />;
};
