import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useAllActiveWorkflowVersions } from '@/workflow/hooks/useAllActiveWorkflowVersions';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';

import { useTheme } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import { IconSettingsAutomation, isDefined } from 'twenty-ui';
import { capitalize } from '~/utils/string/capitalize';

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

  const selectedRecord = useRecoilValue(
    recordStoreFamilyState(selectedRecordId ?? ''),
  );

  const { records: activeWorkflowVersions } = useAllActiveWorkflowVersions({
    objectMetadataItem,
    triggerType: 'MANUAL',
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const { enqueueSnackBar } = useSnackBar();

  const theme = useTheme();

  const registerWorkflowRunRecordActions = () => {
    if (!isDefined(objectMetadataItem) || objectMetadataItem.isRemote) {
      return;
    }

    for (const [
      index,
      activeWorkflowVersion,
    ] of activeWorkflowVersions.entries()) {
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
            payload: selectedRecord,
          });

          enqueueSnackBar('', {
            variant: SnackBarVariant.Success,
            title: `${name} starting...`,
            icon: (
              <IconSettingsAutomation
                size={16}
                color={theme.snackBar.success.color}
              />
            ),
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
