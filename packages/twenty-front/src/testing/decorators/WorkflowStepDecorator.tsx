import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { WorkflowStepContextProvider } from '@/workflow/states/context/WorkflowStepContext';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { Decorator } from '@storybook/react';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import {
  getWorkflowMock,
  getWorkflowNodeIdMock,
} from '~/testing/mock-data/workflow';

export const WorkflowStepDecorator: Decorator = (Story) => {
  const setWorkflowId = useSetRecoilState(workflowIdState);
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);
  const setFlow = useSetRecoilComponentStateV2(flowComponentState);
  const workflowVersion = getWorkflowMock().versions.edges[0]
    .node as WorkflowVersion;
  const { populateStepsOutputSchema } = useStepsOutputSchema();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWorkflowId(getWorkflowMock().id);
    setWorkflowSelectedNode(getWorkflowNodeIdMock());
    setFlow({
      workflowVersionId: workflowVersion.id,
      trigger: workflowVersion.trigger,
      steps: workflowVersion.steps,
    });
    populateStepsOutputSchema(workflowVersion);
    setReady(true);
  }, [
    setWorkflowId,
    setWorkflowSelectedNode,
    populateStepsOutputSchema,
    workflowVersion,
    setFlow,
  ]);

  return (
    <WorkflowStepContextProvider
      value={{
        workflowVersionId: workflowVersion.id,
        workflowRunId: '123',
      }}
    >
      {ready && <Story />}
    </WorkflowStepContextProvider>
  );
};
