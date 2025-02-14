import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { Decorator } from '@storybook/react';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import {
  getWorkflowMock,
  getWorkflowNodeIdMock,
} from '~/testing/mock-data/workflow';

export const WorkflowStepDecorator: Decorator = (Story) => {
  const setWorkflowId = useSetRecoilState(workflowIdState);
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  useEffect(() => {
    setWorkflowId(getWorkflowMock().id);
    setWorkflowSelectedNode(getWorkflowNodeIdMock());
  }, [setWorkflowId, setWorkflowSelectedNode]);

  return <Story />;
};
