import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { usePreviewCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewCoreWorkflowVersion';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { CoreWorkflowVersionStatus } from '~/generated/graphql';

export const useRestoreCoreWorkflowVersionAsDraft = (workflowId: string) => {
  const { t } = useLingui();
  const [isRestoring, setIsRestoring] = useState(false);
  const {
    previewedCoreWorkflowVersion,
    cancelCoreWorkflowVersionPreviewIfStillOn,
  } = usePreviewCoreWorkflowVersion(workflowId);
  const { coreWorkflowVersions } = useCoreWorkflowVersions(workflowId);
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const { enqueueErrorSnackBar } = useSnackBar();

  const hasExistingDraft = coreWorkflowVersions.some(
    (coreWorkflowVersion) =>
      coreWorkflowVersion.status === CoreWorkflowVersionStatus.DRAFT,
  );

  const restoreCoreWorkflowVersionAsDraft = async () => {
    if (!isDefined(previewedCoreWorkflowVersion) || isRestoring) {
      return;
    }

    const restoredCoreWorkflowVersionId =
      previewedCoreWorkflowVersion.coreWorkflowVersionId;

    setIsRestoring(true);

    try {
      await createDraftFromWorkflowVersion({
        workflowId,
        workflowVersionIdToCopy:
          previewedCoreWorkflowVersion.workspaceWorkflowVersionId,
      });

      cancelCoreWorkflowVersionPreviewIfStillOn(restoredCoreWorkflowVersionId);
    } catch {
      enqueueErrorSnackBar({
        message: t`Could not restore this version as draft.`,
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    restoreCoreWorkflowVersionAsDraft,
    isRestoring,
    hasExistingDraft,
  };
};
