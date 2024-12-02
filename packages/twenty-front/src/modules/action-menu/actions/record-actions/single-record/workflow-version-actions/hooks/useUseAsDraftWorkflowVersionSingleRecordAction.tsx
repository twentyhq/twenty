import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { OverrideWorkflowDraftConfirmationModal } from '@/workflow/components/OverrideWorkflowDraftConfirmationModal';
import { useCreateNewWorkflowVersion } from '@/workflow/hooks/useCreateNewWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { openOverrideWorkflowDraftConfirmationModalState } from '@/workflow/states/openOverrideWorkflowDraftConfirmationModalState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconPencil, isDefined } from 'twenty-ui';

export const useUseAsDraftWorkflowVersionSingleRecordAction = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const workflowVersion = useRecoilValue(
    recordStoreFamilyState(workflowVersionId),
  );

  const workflow = useWorkflowWithCurrentVersion(
    workflowVersion?.workflow?.id ?? '',
  );

  const { createNewWorkflowVersion } = useCreateNewWorkflowVersion();

  const setOpenOverrideWorkflowDraftConfirmationModal = useSetRecoilState(
    openOverrideWorkflowDraftConfirmationModalState,
  );

  const registerUseAsDraftWorkflowVersionSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (
      !isDefined(workflowVersion) ||
      !isDefined(workflow) ||
      !isDefined(workflow.statuses) ||
      workflowVersion.status === 'DRAFT'
    ) {
      return;
    }

    const hasAlreadyDraftVersion = workflow.statuses.includes('DRAFT');

    addActionMenuEntry({
      key: 'use-workflow-version-as-draft-single-record',
      label: 'Use as draft',
      position,
      Icon: IconPencil,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      onClick: async () => {
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
      },
      ConfirmationModal: (
        <OverrideWorkflowDraftConfirmationModal
          draftWorkflowVersionId={workflow?.currentVersion?.id ?? ''}
          workflowId={workflow?.id ?? ''}
          workflowVersionUpdateInput={{
            steps: workflowVersion.steps,
            trigger: workflowVersion.trigger,
          }}
        />
      ),
    });
  };

  const unregisterUseAsDraftWorkflowVersionSingleRecordAction = () => {
    removeActionMenuEntry('use-workflow-version-as-draft-single-record');
  };

  return {
    registerUseAsDraftWorkflowVersionSingleRecordAction,
    unregisterUseAsDraftWorkflowVersionSingleRecordAction,
  };
};
