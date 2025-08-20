import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type Decorator } from '@storybook/react';
import { useEffect, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import {
  getWorkflowMock,
  getWorkflowNodeIdMock,
} from '~/testing/mock-data/workflow';

export const WorkflowStepDecorator: Decorator = (Story) => {
  const workflowVisualizerComponentInstanceId = 'workflow-visualizer-test-id';

  const workflowVersion = getWorkflowMock().versions.edges[0]
    .node as WorkflowVersion;
  const { populateStepsOutputSchema } = useStepsOutputSchema();
  const [ready, setReady] = useState(false);

  const handleMount = useRecoilCallback(
    ({ set }) =>
      () => {
        set(
          workflowVisualizerWorkflowIdComponentState.atomFamily({
            instanceId: workflowVisualizerComponentInstanceId,
          }),
          getWorkflowMock().id,
        );
        set(
          workflowVisualizerWorkflowVersionIdComponentState.atomFamily({
            instanceId: workflowVisualizerComponentInstanceId,
          }),
          workflowVersion.id,
        );
        set(
          workflowVisualizerWorkflowRunIdComponentState.atomFamily({
            instanceId: workflowVisualizerComponentInstanceId,
          }),
          '123',
        );
        set(
          workflowSelectedNodeComponentState.atomFamily({
            instanceId: workflowVisualizerComponentInstanceId,
          }),
          getWorkflowNodeIdMock(),
        );
        set(
          flowComponentState.atomFamily({
            instanceId: workflowVisualizerComponentInstanceId,
          }),
          {
            workflowVersionId: workflowVersion.id,
            trigger: workflowVersion.trigger,
            steps: workflowVersion.steps,
          },
        );
        populateStepsOutputSchema(workflowVersion);
        setReady(true);
      },
    [populateStepsOutputSchema, workflowVersion],
  );

  useEffect(() => {
    handleMount();
  }, [handleMount]);

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: workflowVisualizerComponentInstanceId,
      }}
    >
      {ready && <Story />}
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
