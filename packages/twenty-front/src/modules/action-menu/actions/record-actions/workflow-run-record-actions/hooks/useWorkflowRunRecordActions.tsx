import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useAllActiveWorkflowVersions } from '@/workflow/hooks/useAllActiveWorkflowVersions';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';

import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared';
import { IconSettingsAutomation, isDefined } from 'twenty-ui';

export const useWorkflowRunRecordActions = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  if (!isDefined(selectedRecordId)) {
    throw new Error('Selected record ID is required');
  }

  const selectedRecord = useRecoilValue(
    recordStoreFamilyState(selectedRecordId),
  );

  const { records: activeWorkflowVersions } = useAllActiveWorkflowVersions({
    objectMetadataItem,
    triggerType: 'MANUAL',
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const registerWorkflowRunRecordActions = () => {
    if (!isDefined(objectMetadataItem) || objectMetadataItem.isRemote) {
      return;
    }

    for (const [
      index,
      activeWorkflowVersion,
    ] of activeWorkflowVersions.entries()) {
      if (!isDefined(activeWorkflowVersion.workflow)) {
        continue;
      }
      const name = capitalize(activeWorkflowVersion.workflow.name);
      addActionMenuEntry({
        type: ActionMenuEntryType.WorkflowRun,
        key: `workflow-run-${activeWorkflowVersion.id}`,
        scope: ActionMenuEntryScope.RecordSelection,
        label: name,
        position: index,
        Icon: IconSettingsAutomation,
        onClick: async () => {
          if (!isDefined(selectedRecord)) {
            return;
          }

          await runWorkflowVersion({
            workflowVersionId: activeWorkflowVersion.id,
            workflowName: name,
            payload: selectedRecord,
          });
        },
      });
    }
  };

  const unregisterWorkflowRunRecordActions = () => {
    for (const activeWorkflowVersion of activeWorkflowVersions) {
      removeActionMenuEntry(`workflow-run-${activeWorkflowVersion.id}`);
    }
  };

  return {
    registerWorkflowRunRecordActions,
    unregisterWorkflowRunRecordActions,
  };
};
