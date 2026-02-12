import { type Meta, type StoryObj } from '@storybook/react-vite';

import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowDiagramEmptyTriggerEditable } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramEmptyTriggerEditable';
import '@xyflow/react/dist/style.css';
import { RecoilRoot } from 'recoil';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';

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
        <RecoilRoot
          initializeState={({ set }) => {
            set(
              workflowSelectedNodeComponentState.atomFamily({
                instanceId: 'workflow-visualizer-instance-id',
              }),
              'trigger-node',
            );
          }}
        >
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
