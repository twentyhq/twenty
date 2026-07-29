import { CombinedGraphQLErrors } from '@apollo/client/errors';

import {
  ConfirmationModal,
  StyledCenteredButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID } from '@/workflow/constants/OverrideWorkflowDraftConfirmationModalId';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { overrideWorkflowDraftConfirmationModalConfigState } from '@/workflow/states/overrideWorkflowDraftConfirmationModalConfigState';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const OverrideWorkflowDraftConfirmationModal = () => {
  const { closeModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  const overrideWorkflowDraftConfirmationModalConfig = useAtomStateValue(
    overrideWorkflowDraftConfirmationModalConfigState,
  );
  const setOverrideWorkflowDraftConfirmationModalConfig = useSetAtomState(
    overrideWorkflowDraftConfirmationModalConfigState,
  );

  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();

  const navigate = useNavigateApp();

  if (!isDefined(overrideWorkflowDraftConfirmationModalConfig)) {
    return null;
  }

  const { workflowId, workflowVersionIdToCopy } =
    overrideWorkflowDraftConfirmationModalConfig;

  const handleOverrideDraft = async () => {
    setIsCreatingDraft(true);

    try {
      await createDraftFromWorkflowVersion({
        workflowId,
        workflowVersionIdToCopy,
      });

      navigate(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: workflowId,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });
    } finally {
      setIsCreatingDraft(false);
      setOverrideWorkflowDraftConfirmationModalConfig(null);
    }
  };

  return (
    <ConfirmationModal
      modalInstanceId={OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID}
      title={t`A draft already exists`}
      subtitle={t`A draft already exists for this workflow. Are you sure you want to erase it?`}
      onConfirmClick={handleOverrideDraft}
      onClose={() => setOverrideWorkflowDraftConfirmationModalConfig(null)}
      loading={isCreatingDraft}
      confirmButtonText={t`Override Draft`}
      AdditionalButtons={
        <StyledCenteredButton
          to={getAppPath(AppPath.RecordShowPage, {
            objectNameSingular: CoreObjectNameSingular.Workflow,
            objectRecordId: workflowId,
          })}
          onClick={() => {
            closeModal(OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID);
            setOverrideWorkflowDraftConfirmationModalConfig(null);
          }}
          variant="secondary"
          title={t`Go to Draft`}
          fullWidth
          justify="center"
        />
      }
    />
  );
};
