import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useAllActiveWorkflowVersions } from '@/workflow/hooks/useAllActiveWorkflowVersions';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';

import { useTheme } from '@emotion/react';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { IconSettingsAutomation, isDefined } from 'twenty-ui';
import { capitalize } from '~/utils/string/capitalize';

export const WorkflowRunRecordActionEffect = ({
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

  useEffect(() => {
    if (!isDefined(objectMetadataItem) || objectMetadataItem.isRemote) {
      return;
    }

    for (const [
      index,
      activeWorkflowVersion,
    ] of activeWorkflowVersions.entries()) {
      addActionMenuEntry({
        type: 'workflow-run',
        key: `workflow-run-${activeWorkflowVersion.id}`,
        label: capitalize(activeWorkflowVersion.workflow.name),
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
            title: `${capitalize(activeWorkflowVersion.workflow.name)} starting...`,
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

    return () => {
      for (const activeWorkflowVersion of activeWorkflowVersions) {
        removeActionMenuEntry(`workflow-run-${activeWorkflowVersion.id}`);
      }
    };
  }, [
    activeWorkflowVersions,
    addActionMenuEntry,
    enqueueSnackBar,
    objectMetadataItem,
    removeActionMenuEntry,
    runWorkflowVersion,
    selectedRecord,
    theme.snackBar.success.color,
  ]);

  return null;
};
