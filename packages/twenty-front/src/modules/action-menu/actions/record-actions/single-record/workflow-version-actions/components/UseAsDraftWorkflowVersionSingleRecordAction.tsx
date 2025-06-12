import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { OverrideWorkflowDraftConfirmationModal } from '@/workflow/components/OverrideWorkflowDraftConfirmationModal';
import { OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID } from '@/workflow/constants/OverrideWorkflowDraftConfirmationModalId';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const UseAsDraftWorkflowVersionSingleRecordAction = () => {
  const { openModal } = useModal();

  const recordId = useSelectedRecordIdOrThrow();
  const workflowVersion = useWorkflowVersion(recordId);
  const workflow = useWorkflowWithCurrentVersion(
    workflowVersion?.workflow?.id ?? '',
  );
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const navigate = useNavigateApp();
  const [hasNavigated, setHasNavigated] = useState(false);

  const hasAlreadyDraftVersion =
    workflow?.versions.some((version) => version.status === 'DRAFT') || false;

  const handleClick = () => {
    if (!isDefined(workflowVersion) || !isDefined(workflow) || hasNavigated) {
      return;
    }

    if (hasAlreadyDraftVersion) {
      openModal(OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID);
    } else {
      const executeActionWithoutWaiting = async () => {
        await createDraftFromWorkflowVersion({
          workflowId: workflowVersion.workflow.id,
          workflowVersionIdToCopy: workflowVersion.id,
        });

        navigate(AppPath.RecordShowPage, {
          objectNameSingular: CoreObjectNameSingular.Workflow,
          objectRecordId: workflowVersion.workflow.id,
        });

        setHasNavigated(true);
      };

      executeActionWithoutWaiting();
    }
  };

  return isDefined(workflowVersion) ? (
    <>
      <Action onClick={handleClick} />
      <OverrideWorkflowDraftConfirmationModal
        workflowId={workflowVersion.workflow.id}
        workflowVersionIdToCopy={workflowVersion.id}
      />
    </>
  ) : null;
};
