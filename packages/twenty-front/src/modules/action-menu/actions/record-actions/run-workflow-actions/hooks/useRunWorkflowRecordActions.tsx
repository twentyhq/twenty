import { Action } from '@/action-menu/actions/components/Action';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useActiveWorkflowVersionsWithManualTrigger } from '@/workflow/hooks/useActiveWorkflowVersionsWithManualTrigger';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';

import {
  type WorkflowTrigger,
  type WorkflowVersion,
} from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilCallback } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated/graphql';

const isManualBulkTrigger = (trigger: WorkflowTrigger) => {
  return (
    trigger.type === 'MANUAL' &&
    trigger?.settings?.availability?.type === 'BULK_RECORDS'
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
  const isIteratorEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_ITERATOR_ENABLED,
  );
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
        activeWorkflowVersion: WorkflowVersion,
      ) => {
        if (
          isIteratorEnabled &&
          isDefined(activeWorkflowVersion?.trigger) &&
          isManualBulkTrigger(activeWorkflowVersion.trigger)
        ) {
          const objectNamePlural = objectMetadataItem.namePlural;
          const selectedRecords = selectedRecordIds
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
        }
      },
    [runWorkflowVersion, isIteratorEnabled, objectMetadataItem],
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
