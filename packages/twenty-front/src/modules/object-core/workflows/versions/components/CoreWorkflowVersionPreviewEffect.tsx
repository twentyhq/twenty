import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { RESTORE_WORKFLOW_VERSION_MODAL_ID } from '@/object-core/workflows/versions/constants/RestoreWorkflowVersionModalId';
import { previewedWorkflowVersionFamilyState } from '@/object-core/workflows/versions/states/previewedWorkflowVersionFamilyState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const CoreWorkflowVersionPreviewEffect = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const setPreviewedWorkflowVersion = useSetAtomFamilyState(
    previewedWorkflowVersionFamilyState,
    { workflowId },
  );
  const previewedWorkflowVersion = useAtomFamilyStateValue(
    previewedWorkflowVersionFamilyState,
    { workflowId },
  );
  const { closeModal } = useModal();

  useEffect(() => {
    setPreviewedWorkflowVersion(null);

    return () => {
      setPreviewedWorkflowVersion(null);
    };
  }, [setPreviewedWorkflowVersion]);

  const isPreviewingWorkflowVersion = isDefined(previewedWorkflowVersion);

  useEffect(() => {
    if (!isPreviewingWorkflowVersion) {
      return;
    }

    return () => {
      closeModal(RESTORE_WORKFLOW_VERSION_MODAL_ID);
    };
  }, [closeModal, isPreviewingWorkflowVersion]);

  return null;
};
