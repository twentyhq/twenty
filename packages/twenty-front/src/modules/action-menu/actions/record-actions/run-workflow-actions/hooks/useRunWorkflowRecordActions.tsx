import { Action } from '@/action-menu/actions/components/Action';
import { isBulkRecordsManualTrigger } from '@/action-menu/actions/record-actions/utils/isBulkRecordsManualTrigger';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useActiveWorkflowVersionsWithManualTrigger } from '@/workflow/hooks/useActiveWorkflowVersionsWithManualTrigger';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';

import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

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

  const { records: activeWorkflowVersions } =
    useActiveWorkflowVersionsWithManualTrigger({
      objectMetadataItem,
      skip,
    });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const runWorkflowVersionOnSelectedRecords = useRecoilCallback(
    ({ snapshot }) =>
      async (
        selectedRecordIds: string[],
        activeWorkflowVersion: Pick<
          WorkflowVersion,
          'id' | 'workflowId' | 'trigger'
        >,
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

        if (
          isDefined(activeWorkflowVersion?.trigger) &&
          isBulkRecordsManualTrigger(activeWorkflowVersion.trigger)
        ) {
          const objectNamePlural = objectMetadataItem.namePlural;
          const selectedRecords = limitedSelectedRecordIds
            .map((recordId) =>
              snapshot.getLoadable(recordStoreFamilyState(recordId)).getValue(),
            )
            .filter(isDefined);

          await runWorkflowVersion({
            workflowId: activeWorkflowVersion.workflowId,
            workflowVersionId: activeWorkflowVersion.id,
            payload: {
              [objectNamePlural]: selectedRecords,
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
              workflowId: activeWorkflowVersion.workflowId,
              workflowVersionId: activeWorkflowVersion.id,
              payload: selectedRecord,
            });
          }
        }
      },
    [runWorkflowVersion, objectMetadataItem, enqueueWarningSnackBar],
  );

  return activeWorkflowVersions
    .filter((activeWorkflowVersion) =>
      isDefined(activeWorkflowVersion.workflow),
    )
    .map((activeWorkflowVersion, index) => {
      const name = capitalize(activeWorkflowVersion.workflow.name);

      const Icon = getIcon(
        activeWorkflowVersion.trigger?.settings.icon,
        COMMAND_MENU_DEFAULT_ICON,
      );

      return {
        type: ActionType.WorkflowRun,
        key: `workflow-run-${activeWorkflowVersion.id}`,
        scope: ActionScope.RecordSelection,
        label: name,
        shortLabel: name,
        position: index,
        Icon,
        isPinned: activeWorkflowVersion.trigger?.settings?.isPinned,
        shouldBeRegistered: () => true,
        component: (
          <Action
            onClick={async () => {
              if (!isDefined(selectedRecordIds)) {
                return;
              }

              await runWorkflowVersionOnSelectedRecords(
                selectedRecordIds,
                activeWorkflowVersion,
              );
            }}
            closeSidePanelOnCommandMenuListActionExecution={false}
          />
        ),
      };
    });
};
