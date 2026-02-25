import { type Meta, type StoryObj } from '@storybook/react-vite';

import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowDiagramEmptyTriggerEditable } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramEmptyTriggerEditable';
import '@xyflow/react/dist/style.css';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { RecoilRoot } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';

const JotaiInitializer = ({
  children,
  selectedNodeId,
}: {
  children: React.ReactNode;
  selectedNodeId?: string;
}) => {
  const store = useStore();

  useEffect(() => {
    if (isDefined(selectedNodeId)) {
      store.set(
        workflowSelectedNodeComponentState.atomFamily({
          instanceId: 'workflow-visualizer-instance-id',
        }),
        selectedNodeId,
      );
    }
  }, [store, selectedNodeId]);

  return <>{children}</>;
};

const meta: Meta<typeof WorkflowDiagramEmptyTriggerEditable> = {
  title: 'Modules/Workflow/WorkflowDiagramEmptyTriggerEditable',
  component: WorkflowDiagramEmptyTriggerEditable,
  decorators: [],
};

export default meta;
type Story = StoryObj<typeof WorkflowDiagramEmptyTriggerEditable>;

export const Default: Story = {
  args: {
    id: 'trigger-node',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative' }}>
        <RecoilRoot>
          <WorkflowVisualizerComponentInstanceContext.Provider
            value={{ instanceId: 'workflow-visualizer-instance-id' }}
          >
            <Story />
          </WorkflowVisualizerComponentInstanceContext.Provider>
        </RecoilRoot>
      </div>
    ),
    ReactflowDecorator,
    ComponentDecorator,
  ],
};

export const Selected: Story = {
  args: {
    id: 'trigger-node',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative' }}>
        <RecoilRoot>
          <WorkflowVisualizerComponentInstanceContext.Provider
            value={{ instanceId: 'workflow-visualizer-instance-id' }}
          >
            <JotaiInitializer selectedNodeId="trigger-node">
              <Story />
            </JotaiInitializer>
          </WorkflowVisualizerComponentInstanceContext.Provider>
        </RecoilRoot>
      </div>
    ),
    ReactflowDecorator,
    ComponentDecorator,
  ],
};
