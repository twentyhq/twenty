import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { OverrideWorkflowDraftConfirmationModal } from '@/workflow/components/OverrideWorkflowDraftConfirmationModal';
import { OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID } from '@/workflow/constants/OverrideWorkflowDraftConfirmationModalId';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useState } from 'react';
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
  const [hasNavigated, setHasNavigated] = useState(false);

  const hasAlreadyDraftVersion =
    workflow?.versions.some((version) => version.status === 'DRAFT') || false;

  const handleExecute = () => {
    if (!isDefined(workflow) || hasNavigated) {
      return;
    }

    if (hasAlreadyDraftVersion) {
      openModal(OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID);
    } else {
      const executeCommandWithoutWaiting = async () => {
        await createDraftFromWorkflowVersion({
          workflowId,
          workflowVersionIdToCopy: workflowVersionId,
        });

        navigate(AppPath.RecordShowPage, {
          objectNameSingular: CoreObjectNameSingular.Workflow,
          objectRecordId: workflowId,
        });

        setHasNavigated(true);
      };

      executeCommandWithoutWaiting();
    }
  };

  return (
    <>
      <HeadlessEngineCommandWrapperEffect execute={handleExecute} />
      <OverrideWorkflowDraftConfirmationModal
        workflowId={workflowId}
        workflowVersionIdToCopy={workflowVersionId}
      />
    </>
  );
};

export const UseAsDraftWorkflowVersionSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const workflowVersion = useWorkflowVersion(recordId ?? '');

  if (!recordId || !isDefined(workflowVersion?.workflow?.id)) {
    throw new Error(
      'Record ID and workflow ID are required to use as draft workflow version',
    );
  }

  return (
    <UseAsDraftWorkflowVersionSingleRecordCommandContent
      workflowId={workflowVersion.workflow.id}
      workflowVersionId={workflowVersion.id}
    />
  );
};
