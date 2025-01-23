import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowDiagramEmptyTrigger } from '../WorkflowDiagramEmptyTrigger';

const meta: Meta<typeof WorkflowDiagramEmptyTrigger> = {
  title: 'Modules/Workflow/WorkflowDiagramEmptyTrigger',
  component: WorkflowDiagramEmptyTrigger,
};

export default meta;
type Story = StoryObj<typeof WorkflowDiagramEmptyTrigger>;

export const Default: Story = {
  decorators: [
    ComponentDecorator,
    (Story) => (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    ),
  ],
};

export const Selected: Story = {
  decorators: [
    ComponentDecorator,
    (Story) => (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    ),
    (Story) => (
      <div className="selectable selected">
        <Story />
      </div>
    ),
  ],
};
