import { isDefined } from 'twenty-shared/utils';

import {
  previewedCoreWorkflowVersionFamilyState,
  type PreviewedCoreWorkflowVersion,
} from '@/object-core/workflows/versions/states/previewedCoreWorkflowVersionFamilyState';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { type CoreWorkflowVersionDto } from '~/generated/graphql';

export const usePreviewCoreWorkflowVersion = (workflowId: string) => {
  const [previewedCoreWorkflowVersion, setPreviewedCoreWorkflowVersion] =
    useAtomFamilyState(previewedCoreWorkflowVersionFamilyState, { workflowId });

  const previewCoreWorkflowVersion = (
    coreWorkflowVersion: CoreWorkflowVersionDto,
  ) => {
    if (!isDefined(coreWorkflowVersion.workspaceWorkflowVersionId)) {
      return;
    }

    setPreviewedCoreWorkflowVersion({
      coreWorkflowVersionId: coreWorkflowVersion.id,
      label: coreWorkflowVersion.label,
      status: coreWorkflowVersion.status,
      trigger: coreWorkflowVersion.trigger ?? null,
      steps: coreWorkflowVersion.steps ?? null,
      workspaceWorkflowVersionId:
        coreWorkflowVersion.workspaceWorkflowVersionId,
    });
  };

  const cancelCoreWorkflowVersionPreview = () => {
    setPreviewedCoreWorkflowVersion(null);
  };

  const cancelCoreWorkflowVersionPreviewIfStillOn = (
    coreWorkflowVersionId: string,
  ) => {
    setPreviewedCoreWorkflowVersion(
      (current: PreviewedCoreWorkflowVersion | null) =>
        current?.coreWorkflowVersionId === coreWorkflowVersionId
          ? null
          : current,
    );
  };

  return {
    previewedCoreWorkflowVersion,
    previewCoreWorkflowVersion,
    cancelCoreWorkflowVersionPreview,
    cancelCoreWorkflowVersionPreviewIfStillOn,
  };
};
