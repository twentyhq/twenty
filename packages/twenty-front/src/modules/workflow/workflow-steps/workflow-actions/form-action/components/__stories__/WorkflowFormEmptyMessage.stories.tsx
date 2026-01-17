import { WorkflowFormEmptyMessage } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormEmptyMessage';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof WorkflowFormEmptyMessage> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowFormEmptyMessage',
  component: WorkflowFormEmptyMessage,
  parameters: {
    layout: 'centered',
  },
  decorators: [],
};

export default meta;
type Story = StoryObj<typeof WorkflowFormEmptyMessage>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const messageTitleContainer = await canvas.findByTestId(
      'empty-form-message-title',
    );
    const messageDescriptionContainer = await canvas.findByTestId(
      'empty-form-message-description',
    );

    expect(messageTitleContainer).toBeVisible();
    expect(messageDescriptionContainer).toBeVisible();
  },
};
