import { Action } from '@/action-menu/actions/components/Action';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowManualTriggers } from '@/workflow/hooks/useWorkflowManualTriggers';
import {
  ManualTriggerAvailabilityTypeEnum,
  type ManualTriggerEntity,
} from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

const isBulkTrigger = (manualTrigger: ManualTriggerEntity): boolean => {
  return (
    manualTrigger.availabilityType ===
    ManualTriggerAvailabilityTypeEnum.BULK_RECORDS
  );
};

export const useRunWorkflowRecordActions = ({
  objectMetadataItem,
  skip,
}: {
  objectMetadataItem: ObjectMetadataItem;
  skip?: boolean;
}) => {
  const { getIcon } = useIcons();
  const { enqueueWarningSnackBar } = useSnackBar();
  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : undefined;

  const { records: manualTriggers } = useWorkflowManualTriggers({
    objectMetadataItem,
    skip,
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const runWorkflowVersionOnSelectedRecords = useRecoilCallback(
    ({ snapshot }) =>
      async (
        selectedRecordIds: string[],
        manualTrigger: ManualTriggerEntity,
      ) => {
        if (selectedRecordIds.length > QUERY_MAX_RECORDS) {
          const selectedCountFormatted =
            selectedRecordIds.length.toLocaleString();
          const limitFormatted = QUERY_MAX_RECORDS.toLocaleString();

          enqueueWarningSnackBar({
            message: t`You selected ${selectedCountFormatted} records but manual triggers can run on at most ${limitFormatted} records at once. Only the first ${limitFormatted} records will be processed.`,
            options: {
              dedupeKey: 'workflow-manual-trigger-selection-limit',
            },
          });
        }

        const limitedSelectedRecordIds = selectedRecordIds.slice(
          0,
          QUERY_MAX_RECORDS,
        );

        if (isBulkTrigger(manualTrigger)) {
          const selectedRecords = limitedSelectedRecordIds
            .map((recordId) =>
              snapshot.getLoadable(recordStoreFamilyState(recordId)).getValue(),
            )
            .filter(isDefined);

          await runWorkflowVersion({
            workflowId: manualTrigger.workflowId,
            workflowVersionId: manualTrigger.workflowVersionId,
            payload: {
              [objectMetadataItem.namePlural]: selectedRecords,
            },
          });
        } else {
          for (const selectedRecordId of limitedSelectedRecordIds) {
            const selectedRecord = snapshot
              .getLoadable(recordStoreFamilyState(selectedRecordId))
              .getValue();

            if (!isDefined(selectedRecord)) {
              continue;
            }

            await runWorkflowVersion({
              workflowId: manualTrigger.workflowId,
              workflowVersionId: manualTrigger.workflowVersionId,
              payload: selectedRecord,
            });
          }
        }
      },
    [runWorkflowVersion, objectMetadataItem, enqueueWarningSnackBar],
  );

  return manualTriggers.map((manualTrigger, index) => {
    const Icon = getIcon(manualTrigger.icon, COMMAND_MENU_DEFAULT_ICON);

    return {
      type: ActionType.WorkflowRun,
      key: `workflow-run-${manualTrigger.workflowVersionId}`,
      scope: ActionScope.RecordSelection,
      label: manualTrigger.label,
      shortLabel: manualTrigger.label,
      position: index,
      Icon,
      isPinned: manualTrigger.isPinned,
      shouldBeRegistered: () => true,
      component: (
        <Action
          onClick={async () => {
            if (!isDefined(selectedRecordIds)) {
              return;
            }

            await runWorkflowVersionOnSelectedRecords(
              selectedRecordIds,
              manualTrigger,
            );
          }}
          closeSidePanelOnCommandMenuListActionExecution={false}
        />
      ),
    };
  });
};
