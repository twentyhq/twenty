import { sidePanelWorkflowIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowIdComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useLoadMockedMetadata } from '~/testing/hooks/useLoadMockedMetadata';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { type Decorator } from '@storybook/react-vite';
import { useAtomValue, useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  mockedWorkflow,
  mockedWorkflowNodeId,
  mockedWorkflowVersion,
} from '~/testing/mock-data/workflow';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

export const WorkflowStepDecorator: Decorator = (Story) => {
  const workflowVisualizerComponentInstanceId = 'workflow-visualizer-test-id';

  const workflowVersion = mockedWorkflowVersion as WorkflowVersion;
  const { populateStepsOutputSchema } = useStepsOutputSchema();
  const { loadMockedMetadataAtomic } = useLoadMockedMetadata();

  const [ready, setReady] = useState(false);

  const store = useStore();

  useEffect(() => {
    const setup = async () => {
      await loadMockedMetadataAtomic();

      store.set(
        workflowVisualizerWorkflowIdComponentState.atomFamily({
          instanceId: workflowVisualizerComponentInstanceId,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        mockedWorkflow.id,
      );
      store.set(
        workflowVisualizerWorkflowVersionIdComponentState.atomFamily({
          instanceId: workflowVisualizerComponentInstanceId,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        workflowVersion.id,
      );
      store.set(
        workflowVisualizerWorkflowRunIdComponentState.atomFamily({
          instanceId: workflowVisualizerComponentInstanceId,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        '123',
      );
      store.set(
        workflowSelectedNodeComponentState.atomFamily({
          instanceId: workflowVisualizerComponentInstanceId,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        mockedWorkflowNodeId,
      );
      store.set(
        flowComponentState.atomFamily({
          instanceId: workflowVisualizerComponentInstanceId,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        {
          workflowVersionId: workflowVersion.id,
          trigger: workflowVersion.trigger,
          steps: workflowVersion.steps,
        },
      );
      store.set(
        sidePanelWorkflowIdComponentState.atomFamily({
          instanceId: workflowVisualizerComponentInstanceId,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        mockedWorkflow.id,
      );
      populateStepsOutputSchema(workflowVersion);
      setReady(true);
    };

    setup();
  }, [
    loadMockedMetadataAtomic,
    populateStepsOutputSchema,
    workflowVersion,
    store,
  ]);

  const workflowVersionId = useAtomValue(
    workflowVisualizerWorkflowVersionIdComponentState.atomFamily({
      instanceId: workflowVisualizerComponentInstanceId,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
  );

  return (
    <SidePanelPageComponentInstanceContext.Provider
      value={{
        instanceId: workflowVisualizerComponentInstanceId,
      }}
    >
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{
          instanceId: workflowVisualizerComponentInstanceId,
        }}
      >
        {ready && isDefined(workflowVersionId) && <Story />}
      </WorkflowVisualizerComponentInstanceContext.Provider>
    </SidePanelPageComponentInstanceContext.Provider>
  );
};
