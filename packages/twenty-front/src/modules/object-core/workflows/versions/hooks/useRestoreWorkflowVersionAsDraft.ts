import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { usePreviewWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewWorkflowVersion';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';

export const useRestoreWorkflowVersionAsDraft = (workflowId: string) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const { previewedWorkflowVersion, cancelWorkflowVersionPreview } =
    usePreviewWorkflowVersion(workflowId);
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();

  const restoreWorkflowVersionAsDraft = async () => {
    if (!isDefined(previewedWorkflowVersion) || isRestoring) {
      return;
    }

    setIsRestoring(true);

    try {
      await createDraftFromWorkflowVersion({
        workflowId,
        workflowVersionIdToCopy:
          previewedWorkflowVersion.workspaceWorkflowVersionId,
      });

      cancelWorkflowVersionPreview();
    } finally {
      setIsRestoring(false);
    }
  };

  return { restoreWorkflowVersionAsDraft, isRestoring };
};
