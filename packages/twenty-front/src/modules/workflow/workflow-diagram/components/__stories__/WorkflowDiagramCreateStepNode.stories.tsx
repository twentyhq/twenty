import { Meta, StoryObj } from '@storybook/react';

import { ReactFlowProvider } from '@xyflow/react';
import { ComponentDecorator } from 'twenty-ui';
import { WorkflowDiagramCreateStepNode } from '../WorkflowDiagramCreateStepNode';

const meta: Meta<typeof WorkflowDiagramCreateStepNode> = {
  title: 'Modules/Workflow/WorkflowDiagram/WorkflowDiagramCreateStepNode',
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

export const Default: Story = {};

export const Selected: Story = {
  decorators: [
    (Story) => (
      <div className="selectable selected">
        <Story />
      </div>
    ),
  ],
};
