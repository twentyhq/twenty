import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useRecoilValue } from 'recoil';
import { IconPower, isDefined } from 'twenty-ui';

export const useActivateWorkflowSingleRecordAction = ({
  position,
}: {
  position: number;
}) => {
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

  const { activateWorkflowVersion } = useActivateWorkflowVersion();
  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    selectedRecord?.id,
  );

  const isWorkflowActive =
    isDefined(workflowWithCurrentVersion) &&
    workflowWithCurrentVersion.currentVersion.status === 'ACTIVE';

  const registerActivateWorkflowSingleRecordAction = () => {
    if (
      !isDefined(workflowWithCurrentVersion) ||
      !isDefined(workflowWithCurrentVersion.currentVersion.trigger)
    ) {
      return;
    }

    addActionMenuEntry({
      key: 'activate-workflow',
      label: isWorkflowActive ? 'Deactivate' : 'Activate',
      position,
      Icon: IconPower,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      onClick: () => {
        isWorkflowActive
          ? deactivateWorkflowVersion(
              workflowWithCurrentVersion.currentVersion.id,
            )
          : activateWorkflowVersion({
              workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
              workflowId: workflowWithCurrentVersion.id,
            });
      },
    });
  };

  const unregisterActivateWorkflowSingleRecordAction = () => {
    removeActionMenuEntry('activate-workflow');
  };

  return {
    registerActivateWorkflowSingleRecordAction,
    unregisterActivateWorkflowSingleRecordAction,
  };
};
