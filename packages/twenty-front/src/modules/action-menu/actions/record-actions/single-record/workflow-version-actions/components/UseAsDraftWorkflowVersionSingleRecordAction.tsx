import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import { OverrideWorkflowDraftConfirmationModal } from '@/workflow/components/OverrideWorkflowDraftConfirmationModal';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { openOverrideWorkflowDraftConfirmationModalState } from '@/workflow/states/openOverrideWorkflowDraftConfirmationModalState';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const UseAsDraftWorkflowVersionSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowVersion = useWorkflowVersion(recordId);
  const workflow = useWorkflowWithCurrentVersion(
    workflowVersion?.workflow?.id ?? '',
  );
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const setOpenOverrideWorkflowDraftConfirmationModal = useSetRecoilState(
    openOverrideWorkflowDraftConfirmationModalState,
  );
  const navigate = useNavigateApp();
  const [hasNavigated, setHasNavigated] = useState(false);

  const hasAlreadyDraftVersion =
    workflow?.versions.some((version) => version.status === 'DRAFT') || false;

  const onClick = () => {
    if (!isDefined(workflowVersion) || !isDefined(workflow) || hasNavigated) {
      return;
    }

    if (hasAlreadyDraftVersion) {
      setOpenOverrideWorkflowDraftConfirmationModal(true);
    } else {
      const executeAction = async () => {
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

      executeAction();
    }
  };

  return isDefined(workflowVersion) ? (
    <>
      <Action onClick={onClick} />
      <OverrideWorkflowDraftConfirmationModal
        workflowId={workflowVersion.workflow.id}
        workflowVersionIdToCopy={workflowVersion.id}
      />
    </>
  ) : null;
};
