import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDiscardCoreWorkflowDraft } from '@/object-core/workflows/hooks/useDiscardCoreWorkflowDraft';
import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const DiscardDraftWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const { deleteOneWorkflowVersion } = useDeleteOneWorkflowVersion();
  const { discardCoreWorkflowDraft } = useDiscardCoreWorkflowDraft();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId ?? '',
  );
  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to discard draft workflow');
  }

  const handleExecute = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    if (isWorkflowCoreIndexPageEnabled) {
      return discardCoreWorkflowDraft({
        workspaceWorkflowVersionId:
          workflowWithCurrentVersion.currentVersion.id,
      });
    }

    return deleteOneWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isDefined(workflowWithCurrentVersion)}
    />
  );
};
