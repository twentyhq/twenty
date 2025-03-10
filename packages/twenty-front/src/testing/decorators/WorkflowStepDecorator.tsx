import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { WorkflowVersionComponentInstanceContext } from '@/workflow/states/context/WorkflowVersionComponentInstanceContext';
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
  const workflowVersion = getWorkflowMock().versions.edges[0]
    .node as WorkflowVersion;
  const { populateStepsOutputSchema } = useStepsOutputSchema({
    instanceIdFromProps: workflowVersion.id,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWorkflowId(getWorkflowMock().id);
    setWorkflowSelectedNode(getWorkflowNodeIdMock());
    populateStepsOutputSchema(workflowVersion);
    setReady(true);
  }, [
    setWorkflowId,
    setWorkflowSelectedNode,
    populateStepsOutputSchema,
    workflowVersion,
  ]);

  return (
    <WorkflowVersionComponentInstanceContext.Provider
      value={{ instanceId: workflowVersion.id }}
    >
      {ready && <Story />}
    </WorkflowVersionComponentInstanceContext.Provider>
  );
};
