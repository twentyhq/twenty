import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { CoreWorkflowVersionStatus } from '~/generated/graphql';

export const useRestoreCoreWorkflowVersionAsDraft = ({
  workflowId,
  workspaceWorkflowVersionId,
}: {
  workflowId: string;
  workspaceWorkflowVersionId: string;
}) => {
  const { t } = useLingui();
  const [isRestoring, setIsRestoring] = useState(false);
  const { coreWorkflowVersions } = useCoreWorkflowVersions(workflowId);
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const { enqueueErrorSnackBar } = useSnackBar();

  const hasExistingDraft = coreWorkflowVersions.some(
    (coreWorkflowVersion) =>
      coreWorkflowVersion.status === CoreWorkflowVersionStatus.DRAFT,
  );

  const restoreCoreWorkflowVersionAsDraft = async () => {
    if (isRestoring) {
      return;
    }

    setIsRestoring(true);

    try {
      await createDraftFromWorkflowVersion({
        workflowId,
        workflowVersionIdToCopy: workspaceWorkflowVersionId,
      });
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
