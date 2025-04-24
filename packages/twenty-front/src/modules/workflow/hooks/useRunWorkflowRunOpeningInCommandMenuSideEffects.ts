import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { flowState } from '@/workflow/states/flowState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowRunIdState } from '@/workflow/states/workflowRunIdState';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
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

        set(workflowRunIdState, workflowRunRecord.id);
        set(workflowIdState, workflowRunRecord.workflowId);
        set(flowState, {
          workflowVersionId: workflowRunRecord.workflowVersionId,
          trigger: workflowRunRecord.output.flow.trigger,
          steps: workflowRunRecord.output.flow.steps,
        });
        set(workflowSelectedNodeState, stepToOpenByDefault.id);

        openWorkflowRunViewStepInCommandMenu({
          workflowId: workflowRunRecord.workflowId,
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
