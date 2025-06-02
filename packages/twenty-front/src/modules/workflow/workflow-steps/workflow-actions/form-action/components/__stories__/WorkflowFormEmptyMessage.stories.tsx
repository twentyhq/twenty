import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { WorkflowFormEmptyMessage } from '../WorkflowFormEmptyMessage';

const meta: Meta<typeof WorkflowFormEmptyMessage> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowFormEmptyMessage',
  component: WorkflowFormEmptyMessage,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowFormEmptyMessage>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const messageContainer = await canvas.findByText('Add inputs to your form');

    expect(messageContainer).toBeVisible();
  },
};
