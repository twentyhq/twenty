import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useRecoilValue } from 'recoil';
import { IconTrash, isDefined } from 'twenty-ui';

export const useDiscardWorkflowDraftSingleRecordAction = () => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const selectedRecord = useRecoilValue(
    recordStoreFamilyState(selectedRecordId ?? ''),
  );

  const { deleteOneWorkflowVersion } = useDeleteOneWorkflowVersion();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    selectedRecord?.id,
  );

  const registerDiscardWorkflowDraftSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (
      !isDefined(workflowWithCurrentVersion) ||
      !isDefined(workflowWithCurrentVersion.currentVersion.trigger)
    ) {
      return;
    }

    const isDraft =
      workflowWithCurrentVersion.currentVersion.status === 'DRAFT';

    if (!isDraft) {
      return;
    }

    addActionMenuEntry({
      key: 'discard-workflow-draft',
      label: 'Discard Draft',
      position,
      Icon: IconTrash,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      onClick: () => {
        deleteOneWorkflowVersion({
          workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
        });
      },
    });
  };

  const unregisterDiscardWorkflowDraftSingleRecordAction = () => {
    removeActionMenuEntry('discard-workflow-draft');
  };

  return {
    registerDiscardWorkflowDraftSingleRecordAction,
    unregisterDiscardWorkflowDraftSingleRecordAction,
  };
};
