import { Action } from '@/action-menu/actions/components/Action';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { getSelectedRecordIdsFromTargetedRecordsRule } from '@/context-store/utils/getSelectedRecordIdsFromTargetedRecordsRule';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useActiveWorkflowVersionsWithManualTrigger } from '@/workflow/hooks/useActiveWorkflowVersionsWithManualTrigger';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';

import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useRecoilCallback, useRecoilValue } from 'recoil';
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
  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();

  const allRecordIds = useRecoilValue(
    recordIndexAllRecordIdsComponentSelector.selectorFamily({
      instanceId: recordIndexId,
    }),
  );

  const selectedRecordIds = getSelectedRecordIdsFromTargetedRecordsRule(
    contextStoreTargetedRecordsRule,
    allRecordIds,
  );

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
        activeWorkflowVersion: WorkflowVersion,
      ) => {
        for (const selectedRecordId of selectedRecordIds) {
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
      },
    [runWorkflowVersion],
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
              if (selectedRecordIds.length === 0) {
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
