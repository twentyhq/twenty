import { Meta, StoryObj } from '@storybook/react';

import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowDiagramCreateStepNode } from '../WorkflowDiagramCreateStepNode';
import { ComponentDecorator } from 'twenty-ui/testing';

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
