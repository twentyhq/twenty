import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRunWorkflowRunOpeningInCommandMenuSideEffects = () => {
  const apolloClient = useApolloClient();
  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();
  const { getIcon } = useIcons();

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
          cache: apolloClient.cache,
          recordId,
          objectMetadataItems,
        });
        if (
          !(isDefined(workflowRunRecord) && isDefined(workflowRunRecord.output))
        ) {
          throw new Error(
            `No workflow run record found for record ID ${recordId}`,
          );
        }

        const { stepToOpenByDefault } = generateWorkflowRunDiagram({
          steps: workflowRunRecord.output.flow.steps,
          stepsOutput: workflowRunRecord.output.stepsOutput,
          trigger: workflowRunRecord.output.flow.trigger,
        });

        if (!isDefined(stepToOpenByDefault)) {
          return;
        }

        set(
          workflowVisualizerWorkflowRunIdComponentState.atomFamily({
            instanceId: getWorkflowVisualizerComponentInstanceId({
              id: recordId,
              isInRightDrawer: true,
            }),
          }),
          workflowRunRecord.id,
        );
        set(
          workflowVisualizerWorkflowIdComponentState.atomFamily({
            instanceId: getWorkflowVisualizerComponentInstanceId({
              id: recordId,
              isInRightDrawer: true,
            }),
          }),
          workflowRunRecord.workflowId,
        );
        set(
          flowComponentState.atomFamily({
            instanceId: getWorkflowVisualizerComponentInstanceId({
              id: recordId,
              isInRightDrawer: true,
            }),
          }),
          {
            workflowVersionId: workflowRunRecord.workflowVersionId,
            trigger: workflowRunRecord.output.flow.trigger,
            steps: workflowRunRecord.output.flow.steps,
          },
        );
        set(
          workflowSelectedNodeComponentState.atomFamily({
            instanceId: getWorkflowVisualizerComponentInstanceId({
              id: recordId,
              isInRightDrawer: true,
            }),
          }),
          stepToOpenByDefault.id,
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
    [apolloClient.cache, getIcon, openWorkflowRunViewStepInCommandMenu],
  );

  return {
    runWorkflowRunOpeningInCommandMenuSideEffects,
  };
};
