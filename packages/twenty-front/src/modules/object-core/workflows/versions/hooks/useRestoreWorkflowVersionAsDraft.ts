import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { usePreviewWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewWorkflowVersion';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { CoreWorkflowVersionStatus } from '~/generated/graphql';

export const useRestoreWorkflowVersionAsDraft = (workflowId: string) => {
  const { t } = useLingui();
  const [isRestoring, setIsRestoring] = useState(false);
  const { previewedWorkflowVersion, cancelWorkflowVersionPreviewIfStillOn } =
    usePreviewWorkflowVersion(workflowId);
  const { coreWorkflowVersions, refetchCoreWorkflowVersions } =
    useCoreWorkflowVersions(workflowId);
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const { enqueueErrorSnackBar } = useSnackBar();

  const hasExistingDraft = coreWorkflowVersions.some(
    (coreWorkflowVersion) =>
      coreWorkflowVersion.status === CoreWorkflowVersionStatus.DRAFT,
  );

  const restoreWorkflowVersionAsDraft = async () => {
    if (!isDefined(previewedWorkflowVersion) || isRestoring) {
      return;
    }

    const restoredWorkflowVersionId =
      previewedWorkflowVersion.coreWorkflowVersionId;

    setIsRestoring(true);

    try {
      await createDraftFromWorkflowVersion({
        workflowId,
        workflowVersionIdToCopy:
          previewedWorkflowVersion.workspaceWorkflowVersionId,
      });

      await refetchCoreWorkflowVersions();
      cancelWorkflowVersionPreviewIfStillOn(restoredWorkflowVersionId);
    } catch {
      enqueueErrorSnackBar({
        message: t`Could not restore this version as draft.`,
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return { restoreWorkflowVersionAsDraft, isRestoring, hasExistingDraft };
};
