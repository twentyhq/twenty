import { Meta, StoryObj } from '@storybook/react';

import '@xyflow/react/dist/style.css';
import { ComponentDecorator } from 'twenty-ui/testing';
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
};

export default meta;
type Story = StoryObj<typeof WorkflowDiagramEmptyTriggerEditable>;

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
