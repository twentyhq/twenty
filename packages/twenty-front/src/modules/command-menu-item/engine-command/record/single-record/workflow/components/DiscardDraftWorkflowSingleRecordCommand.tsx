import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { useDiscardWorkspaceWorkflowDraft } from '@/workflow/hooks/useDiscardWorkspaceWorkflowDraft';
import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDiscardCoreWorkflowDraft } from '@/object-core/workflows/hooks/useDiscardCoreWorkflowDraft';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';

const DiscardCoreWorkflowDraftCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const { discardCoreWorkflowDraft } = useDiscardCoreWorkflowDraft();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId ?? '',
  );

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to discard draft workflow');
  }

  const handleExecute = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    return discardCoreWorkflowDraft({
      coreWorkflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isDefined(workflowWithCurrentVersion)}
    />
  );
};

const DiscardWorkspaceWorkflowDraftCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const workflow = useWorkflowWithCurrentVersion(selectedRecords[0]?.id);
  const { discardWorkspaceWorkflowDraft } = useDiscardWorkspaceWorkflowDraft();

  return (
    <HeadlessEngineCommandWrapperEffect
      ready={isDefined(workflow)}
      execute={() =>
        isDefined(workflow)
          ? discardWorkspaceWorkflowDraft({
              workspaceWorkflowVersionId: workflow.currentVersion.id,
            })
          : undefined
      }
    />
  );
};

export const DiscardDraftWorkflowSingleRecordCommand = () => {
  const isCore = useIsWorkflowCoreEnabled();
  return isCore ? (
    <DiscardCoreWorkflowDraftCommand />
  ) : (
    <DiscardWorkspaceWorkflowDraftCommand />
  );
};
