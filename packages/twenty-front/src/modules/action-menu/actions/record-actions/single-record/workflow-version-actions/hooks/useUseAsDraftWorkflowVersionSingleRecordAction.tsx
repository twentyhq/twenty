import { SingleRecordActionHook } from '@/action-menu/actions/types/singleRecordActionHook';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { OverrideWorkflowDraftConfirmationModal } from '@/workflow/components/OverrideWorkflowDraftConfirmationModal';
import { useCreateNewWorkflowVersion } from '@/workflow/hooks/useCreateNewWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { openOverrideWorkflowDraftConfirmationModalState } from '@/workflow/states/openOverrideWorkflowDraftConfirmationModalState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useUseAsDraftWorkflowVersionSingleRecordAction: SingleRecordActionHook =
  (recordId) => {
    const workflowVersion = useRecoilValue(recordStoreFamilyState(recordId));

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
    ) : null;

    return {
      shouldBeRegistered,
      onClick,
      ConfirmationModal,
    };
  };
