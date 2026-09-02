import { isDefined } from 'twenty-shared/utils';

import { previewedWorkflowVersionFamilyState } from '@/object-core/workflows/versions/states/previewedWorkflowVersionFamilyState';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

type SelectableCoreWorkflowVersion = {
  id: string;
  label: string;
  workspaceWorkflowVersionId?: string | null;
};

export const usePreviewWorkflowVersion = (workflowId: string) => {
  const [previewedWorkflowVersion, setPreviewedWorkflowVersion] =
    useAtomFamilyState(previewedWorkflowVersionFamilyState, { workflowId });

  const previewWorkflowVersion = (
    coreWorkflowVersion: SelectableCoreWorkflowVersion,
  ) => {
    if (!isDefined(coreWorkflowVersion.workspaceWorkflowVersionId)) {
      return;
    }

    setPreviewedWorkflowVersion({
      coreWorkflowVersionId: coreWorkflowVersion.id,
      workspaceWorkflowVersionId:
        coreWorkflowVersion.workspaceWorkflowVersionId,
      label: coreWorkflowVersion.label,
    });
  };

  const cancelWorkflowVersionPreview = () => {
    setPreviewedWorkflowVersion(null);
  };

  const cancelWorkflowVersionPreviewIfStillOn = (
    coreWorkflowVersionId: string,
  ) => {
    setPreviewedWorkflowVersion((currentPreviewedWorkflowVersion) =>
      currentPreviewedWorkflowVersion?.coreWorkflowVersionId ===
      coreWorkflowVersionId
        ? null
        : currentPreviewedWorkflowVersion,
    );
  };

  return {
    previewedWorkflowVersion,
    previewWorkflowVersion,
    cancelWorkflowVersionPreview,
    cancelWorkflowVersionPreviewIfStillOn,
  };
};
