import { Meta, StoryObj } from '@storybook/react';

import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import '@xyflow/react/dist/style.css';
import { RecoilRoot } from 'recoil';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';
import { WorkflowDiagramEmptyTriggerEditable } from '../WorkflowDiagramEmptyTriggerEditable';

const meta: Meta<typeof WorkflowDiagramEmptyTriggerEditable> = {
  title: 'Modules/Workflow/WorkflowDiagramEmptyTriggerEditable',
  component: WorkflowDiagramEmptyTriggerEditable,
  args: {
    data: {
      nodeType: 'empty-trigger',
    },
  },
  decorators: [I18nFrontDecorator],
};

export default meta;
type Story = StoryObj<typeof WorkflowDiagramEmptyTriggerEditable>;

export const Default: Story = {
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
  decorators: [
    (Story) => (
      <div className="selectable selected" style={{ position: 'relative' }}>
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
