import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { type WorkflowRun } from '@/workflow/types/Workflow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { workflowRunDiagramAutomaticallyOpenedStepsComponentState } from '@/workflow/workflow-diagram/states/workflowRunDiagramAutomaticallyOpenedStepsComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRunWorkflowRunOpeningInCommandMenuSideEffects = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();
  const { getIcon } = useIcons();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const runWorkflowRunOpeningInCommandMenuSideEffects = useCallback(
    ({
      objectMetadataItem,
      recordId,
    }: {
      objectMetadataItem: ObjectMetadataItem;
      recordId: string;
    }) => {
      const objectMetadataItems = jotaiStore.get(objectMetadataItemsState.atom);

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
      });

      if (!isDefined(stepToOpenByDefault)) {
        return;
      }

      const instanceId = getWorkflowVisualizerComponentInstanceId({
        recordId,
      });

      jotaiStore.set(
        workflowVisualizerWorkflowRunIdComponentState.atomFamily({
          instanceId,
        }),
        workflowRunRecord.id,
      );
      jotaiStore.set(
        workflowVisualizerWorkflowIdComponentState.atomFamily({
          instanceId,
        }),
        workflowRunRecord.workflowId,
      );
      jotaiStore.set(
        flowComponentState.atomFamily({
          instanceId,
        }),
        {
          workflowVersionId: workflowRunRecord.workflowVersionId,
          trigger: workflowRunRecord.state.flow.trigger,
          steps: workflowRunRecord.state.flow.steps,
        },
      );
      jotaiStore.set(
        workflowSelectedNodeComponentState.atomFamily({
          instanceId,
        }),
        stepToOpenByDefault.id,
      );

      jotaiStore.set(
        workflowRunDiagramAutomaticallyOpenedStepsComponentState.atomFamily({
          instanceId,
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
      openWorkflowRunViewStepInCommandMenu,
      getIcon,
    ],
  );

  return {
    runWorkflowRunOpeningInCommandMenuSideEffects,
  };
};
