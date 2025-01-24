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
    (Story) => (
      <ReactFlowProvider>
        <div style={{ position: 'relative' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
    ComponentDecorator,
  ],
};

export const Selected: Story = {
  decorators: [
    (Story) => (
      <div className="selectable selected" style={{ position: 'relative' }}>
        <Story />
      </div>
    ),
    (Story) => (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    ),
    ComponentDecorator,
  ],
};
