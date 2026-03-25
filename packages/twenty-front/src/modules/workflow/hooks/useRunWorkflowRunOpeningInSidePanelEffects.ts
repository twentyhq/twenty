import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
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
import { useStore } from 'jotai';

export const useRunWorkflowRunOpeningInSidePanelEffects = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const { openWorkflowRunViewStepInSidePanel } =
    useSidePanelWorkflowNavigation();
  const { getIcon } = useIcons();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const runWorkflowRunOpeningInSidePanelEffects = useCallback(
    ({
      objectMetadataItem,
      recordId,
    }: {
      objectMetadataItem: EnrichedObjectMetadataItem;
      recordId: string;
    }) => {
      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

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

      store.set(
        workflowVisualizerWorkflowRunIdComponentState.atomFamily({
          instanceId,
        }),
        workflowRunRecord.id,
      );
      store.set(
        workflowVisualizerWorkflowIdComponentState.atomFamily({
          instanceId,
        }),
        workflowRunRecord.workflowId,
      );
      store.set(
        flowComponentState.atomFamily({
          instanceId,
        }),
        {
          workflowVersionId: workflowRunRecord.workflowVersionId,
          trigger: workflowRunRecord.state.flow.trigger,
          steps: workflowRunRecord.state.flow.steps,
        },
      );
      store.set(
        workflowSelectedNodeComponentState.atomFamily({
          instanceId,
        }),
        stepToOpenByDefault.id,
      );

      store.set(
        workflowRunDiagramAutomaticallyOpenedStepsComponentState.atomFamily({
          instanceId,
        }),
        (steps) => [
          ...steps,
          {
            stepId: stepToOpenByDefault.id,
            isInSidePanel: true,
          },
        ],
      );
      openWorkflowRunViewStepInSidePanel({
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
      openWorkflowRunViewStepInSidePanel,
      getIcon,
      store,
    ],
  );

  return {
    runWorkflowRunOpeningInSidePanelEffects,
  };
};
