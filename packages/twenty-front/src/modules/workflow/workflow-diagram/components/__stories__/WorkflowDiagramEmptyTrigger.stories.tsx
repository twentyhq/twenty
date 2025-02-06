import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import '@xyflow/react/dist/style.css';
import { ReactflowDecorator } from '~/testing/decorators/ReactflowDecorator';
import { WorkflowDiagramEmptyTrigger } from '../WorkflowDiagramEmptyTrigger';

const meta: Meta<typeof WorkflowDiagramEmptyTrigger> = {
  title: 'Modules/Workflow/WorkflowDiagramEmptyTrigger',
  component: WorkflowDiagramEmptyTrigger,
  args: {
    data: {
      nodeType: 'empty-trigger',
      isLeafNode: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowDiagramEmptyTrigger>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ position: 'relative' }}>
        <Story />
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
        <Story />
      </div>
    ),
    ReactflowDecorator,
    ComponentDecorator,
  ],
};

export const IsNotLeafNode: Story = {
  decorators: [
    (Story) => (
      <div style={{ position: 'relative' }}>
        <Story />
      </div>
    ),
    ComponentDecorator,
    ReactflowDecorator,
  ],
  args: {
    data: {
      nodeType: 'empty-trigger',
      isLeafNode: false,
    },
  },
};
