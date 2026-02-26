import { commandMenuWorkflowIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowIdComponentState';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
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

export const WorkflowStepDecorator: Decorator = (Story) => {
  const workflowVisualizerComponentInstanceId = 'workflow-visualizer-test-id';

  const workflowVersion = mockedWorkflowVersion as WorkflowVersion;
  const { populateStepsOutputSchema } = useStepsOutputSchema();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();

  const [metadataLoaded, setMetadataLoaded] = useState(false);

  const store = useStore();

  useEffect(() => {
    loadMockedObjectMetadataItems().then(() => setMetadataLoaded(true));
  }, [loadMockedObjectMetadataItems]);

  useEffect(() => {
    if (!metadataLoaded) {
      return;
    }

    store.set(
      workflowVisualizerWorkflowIdComponentState.atomFamily({
        instanceId: workflowVisualizerComponentInstanceId,
      }),
      mockedWorkflow.id,
    );
    store.set(
      workflowVisualizerWorkflowVersionIdComponentState.atomFamily({
        instanceId: workflowVisualizerComponentInstanceId,
      }),
      workflowVersion.id,
    );
    store.set(
      workflowVisualizerWorkflowRunIdComponentState.atomFamily({
        instanceId: workflowVisualizerComponentInstanceId,
      }),
      '123',
    );
    store.set(
      workflowSelectedNodeComponentState.atomFamily({
        instanceId: workflowVisualizerComponentInstanceId,
      }),
      mockedWorkflowNodeId,
    );
    store.set(
      flowComponentState.atomFamily({
        instanceId: workflowVisualizerComponentInstanceId,
      }),
      {
        workflowVersionId: workflowVersion.id,
        trigger: workflowVersion.trigger,
        steps: workflowVersion.steps,
      },
    );
    store.set(
      commandMenuWorkflowIdComponentState.atomFamily({
        instanceId: workflowVisualizerComponentInstanceId,
      }),
      mockedWorkflow.id,
    );
    populateStepsOutputSchema(workflowVersion);
  }, [metadataLoaded, populateStepsOutputSchema, workflowVersion, store]);

  const workflowVersionId = useAtomValue(
    workflowVisualizerWorkflowVersionIdComponentState.atomFamily({
      instanceId: workflowVisualizerComponentInstanceId,
    }),
  );

  return (
    <CommandMenuPageComponentInstanceContext.Provider
      value={{
        instanceId: workflowVisualizerComponentInstanceId,
      }}
    >
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{
          instanceId: workflowVisualizerComponentInstanceId,
        }}
      >
        {isDefined(workflowVersionId) && <Story />}
      </WorkflowVisualizerComponentInstanceContext.Provider>
    </CommandMenuPageComponentInstanceContext.Provider>
  );
};
