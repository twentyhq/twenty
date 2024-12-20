import { SingleRecordActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { OverrideWorkflowDraftConfirmationModal } from '@/workflow/components/OverrideWorkflowDraftConfirmationModal';
import { useCreateNewWorkflowVersion } from '@/workflow/hooks/useCreateNewWorkflowVersion';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { openOverrideWorkflowDraftConfirmationModalState } from '@/workflow/states/openOverrideWorkflowDraftConfirmationModalState';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useUseAsDraftWorkflowVersionSingleRecordAction: SingleRecordActionHookWithoutObjectMetadataItem =
  ({ recordId }) => {
    const workflowVersion = useWorkflowVersion(recordId);

    const workflow = useWorkflowWithCurrentVersion(
      workflowVersion?.workflow?.id ?? '',
    );

    const { createNewWorkflowVersion } = useCreateNewWorkflowVersion();

    const setOpenOverrideWorkflowDraftConfirmationModal = useSetRecoilState(
      openOverrideWorkflowDraftConfirmationModalState,
    );

    const workflowStatuses = workflow?.statuses;

    const shouldBeRegistered =
      isDefined(workflowVersion) &&
      isDefined(workflow) &&
      isDefined(workflowStatuses) &&
      workflowVersion.status !== 'DRAFT';

    const onClick = async () => {
      if (!shouldBeRegistered) return;

      const hasAlreadyDraftVersion = workflowStatuses.includes('DRAFT');

      if (hasAlreadyDraftVersion) {
        setOpenOverrideWorkflowDraftConfirmationModal(true);
      } else {
        await createNewWorkflowVersion({
          workflowId: workflowVersion.workflow.id,
          name: `v${workflow.versions.length + 1}`,
          status: 'DRAFT',
          trigger: workflowVersion.trigger,
          steps: workflowVersion.steps,
        });
      }
    };

    const ConfirmationModal = shouldBeRegistered ? (
      <OverrideWorkflowDraftConfirmationModal
        draftWorkflowVersionId={workflow?.currentVersion?.id ?? ''}
        workflowId={workflow?.id ?? ''}
        workflowVersionUpdateInput={{
          steps: workflowVersion.steps,
          trigger: workflowVersion.trigger,
        }}
      />
    ) : undefined;

    return {
      shouldBeRegistered,
      onClick,
      ConfirmationModal,
    };
  };
