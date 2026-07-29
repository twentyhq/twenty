import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID } from '@/workflow/constants/OverrideWorkflowDraftConfirmationModalId';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { overrideWorkflowDraftConfirmationModalConfigState } from '@/workflow/states/overrideWorkflowDraftConfirmationModalConfigState';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const UseAsDraftWorkflowVersionSingleRecordCommandContent = ({
  workflowId,
  workflowVersionId,
}: {
  workflowId: string;
  workflowVersionId: string;
}) => {
  const { openModal } = useModal();
  const workflow = useWorkflowWithCurrentVersion(workflowId);
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const navigate = useNavigateApp();

  const setOverrideWorkflowDraftConfirmationModalConfig = useSetAtomState(
    overrideWorkflowDraftConfirmationModalConfigState,
  );

  const hasAlreadyDraftVersion =
    workflow?.versions.some((version) => version.status === 'DRAFT') ?? false;

  const handleExecute = async () => {
    // The confirmation modal is rendered outside of the command because the
    // command unmounts as soon as it has been executed
    if (hasAlreadyDraftVersion) {
      setOverrideWorkflowDraftConfirmationModalConfig({
        workflowId,
        workflowVersionIdToCopy: workflowVersionId,
      });

      openModal(OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID);

      return;
    }

    await createDraftFromWorkflowVersion({
      workflowId,
      workflowVersionIdToCopy: workflowVersionId,
    });

    navigate(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Workflow,
      objectRecordId: workflowId,
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isDefined(workflow)}
    />
  );
};

export const UseAsDraftWorkflowVersionSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];

  if (!isDefined(selectedRecord) || !isDefined(selectedRecord.workflowId)) {
    throw new Error(
      'Record ID and workflow ID are required to use as draft workflow version',
    );
  }

  return (
    <UseAsDraftWorkflowVersionSingleRecordCommandContent
      workflowId={selectedRecord.workflowId}
      workflowVersionId={selectedRecord.id}
    />
  );
};
