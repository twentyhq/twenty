import { Meta, StoryObj } from '@storybook/react';

import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ComponentDecorator } from 'twenty-ui';
import { WorkflowDiagramCreateStepNode } from '../WorkflowDiagramCreateStepNode';

const meta: Meta<typeof WorkflowDiagramCreateStepNode> = {
  title: 'Modules/Workflow/WorkflowDiagramCreateStepNode',
  component: WorkflowDiagramCreateStepNode,
  decorators: [
    ComponentDecorator,
    (Story) => (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowDiagramCreateStepNode>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

export const Selected: Story = {
  decorators: [
    (Story) => (
      <div className="selectable selected" style={{ position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};
