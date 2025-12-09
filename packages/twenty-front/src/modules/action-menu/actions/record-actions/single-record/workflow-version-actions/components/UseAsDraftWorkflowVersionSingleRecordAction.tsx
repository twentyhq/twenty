import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { OverrideWorkflowDraftConfirmationModal } from '@/workflow/components/OverrideWorkflowDraftConfirmationModal';
import { OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID } from '@/workflow/constants/OverrideWorkflowDraftConfirmationModalId';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const UseAsDraftWorkflowVersionSingleRecordActionContent = ({
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

  const handleClick = () => {
    if (!isDefined(workflow) || hasNavigated) {
      return;
    }

    if (hasAlreadyDraftVersion) {
      openModal(OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID);
    } else {
      const executeActionWithoutWaiting = async () => {
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

      executeActionWithoutWaiting();
    }
  };

  return (
    <>
      <Action onClick={handleClick} />
      <OverrideWorkflowDraftConfirmationModal
        workflowId={workflowId}
        workflowVersionIdToCopy={workflowVersionId}
      />
    </>
  );
};

export const UseAsDraftWorkflowVersionSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowVersion = useWorkflowVersion(recordId);

  if (!isDefined(workflowVersion?.workflow?.id)) {
    return null;
  }

  return (
    <UseAsDraftWorkflowVersionSingleRecordActionContent
      workflowId={workflowVersion.workflow.id}
      workflowVersionId={workflowVersion.id}
    />
  );
};
