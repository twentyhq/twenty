import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { isHeadlessTriggerWorkflowVersionCommandContextApi } from '@/command-menu-item/engine-command/utils/isHeadlessTriggerWorkflowVersionCommandContextApi';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useCallback } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const TriggerWorkflowVersionEngineCommand = () => {
  const mountedCommandState = useHeadlessCommandContextApi();

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const execute = useCallback(async () => {
    if (
      !isHeadlessTriggerWorkflowVersionCommandContextApi(mountedCommandState)
    ) {
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
