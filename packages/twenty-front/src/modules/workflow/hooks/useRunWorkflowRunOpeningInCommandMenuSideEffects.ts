import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { workflowRunDiagramAutomaticallyOpenedStepsComponentState } from '@/workflow/workflow-diagram/states/workflowRunDiagramAutomaticallyOpenedStepsComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated/graphql';

export const useRunWorkflowRunOpeningInCommandMenuSideEffects = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();
  const { getIcon } = useIcons();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const isWorkflowFilteringEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_FILTERING_ENABLED,
  );

  const runWorkflowRunOpeningInCommandMenuSideEffects = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        objectMetadataItem,
        recordId,
      }: {
        objectMetadataItem: ObjectMetadataItem;
        recordId: string;
      }) => {
        const objectMetadataItems = getSnapshotValue(
          snapshot,
          objectMetadataItemsState,
        );

        const workflowRunRecord = getRecordFromCache<WorkflowRun>({
          objectMetadataItem,
          cache: apolloCoreClient.cache,
          recordId,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
        });
        if (
          !(isDefined(workflowRunRecord) && isDefined(workflowRunRecord.state))
        ) {
          return;
        }

        const { stepToOpenByDefault } = generateWorkflowRunDiagram({
          steps: workflowRunRecord.state.flow.steps,
          stepInfos: workflowRunRecord.state.stepInfos,
          trigger: workflowRunRecord.state.flow.trigger,
          isWorkflowFilteringEnabled,
        });

        if (!isDefined(stepToOpenByDefault)) {
          return;
        }

        set(
          workflowVisualizerWorkflowRunIdComponentState.atomFamily({
            instanceId: getWorkflowVisualizerComponentInstanceId({
              recordId,
            }),
          }),
          workflowRunRecord.id,
        );
        set(
          workflowVisualizerWorkflowIdComponentState.atomFamily({
            instanceId: getWorkflowVisualizerComponentInstanceId({
              recordId,
            }),
          }),
          workflowRunRecord.workflowId,
        );
        set(
          flowComponentState.atomFamily({
            instanceId: getWorkflowVisualizerComponentInstanceId({
              recordId,
            }),
          }),
          {
            workflowVersionId: workflowRunRecord.workflowVersionId,
            trigger: workflowRunRecord.state.flow.trigger,
            steps: workflowRunRecord.state.flow.steps,
          },
        );
        set(
          workflowSelectedNodeComponentState.atomFamily({
            instanceId: getWorkflowVisualizerComponentInstanceId({
              recordId,
            }),
          }),
          stepToOpenByDefault.id,
        );

        set(
          workflowRunDiagramAutomaticallyOpenedStepsComponentState.atomFamily({
            instanceId: getWorkflowVisualizerComponentInstanceId({
              recordId,
            }),
          }),
          (steps) => [
            ...steps,
            {
              stepId: stepToOpenByDefault.id,
              isInRightDrawer: true,
            },
          ],
        );
        openWorkflowRunViewStepInCommandMenu({
          workflowId: workflowRunRecord.workflowId,
          workflowRunId: workflowRunRecord.id,
          title: stepToOpenByDefault.data.name,
          icon: getIcon(getWorkflowNodeIconKey(stepToOpenByDefault.data)),
          workflowSelectedNode: stepToOpenByDefault.id,
          stepExecutionStatus: stepToOpenByDefault.data.runStatus,
        });
      },
    [
      apolloCoreClient.cache,
      objectPermissionsByObjectMetadataId,
      isWorkflowFilteringEnabled,
      openWorkflowRunViewStepInCommandMenu,
      getIcon,
    ],
  );

  return {
    runWorkflowRunOpeningInCommandMenuSideEffects,
  };
};
