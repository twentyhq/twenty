import { WorkflowMessage } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowMessage';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof WorkflowMessage> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowMessage',
  component: WorkflowMessage,
  parameters: {
    layout: 'centered',
  },
  decorators: [],
};

export default meta;
type Story = StoryObj<typeof WorkflowMessage>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const messageTitleContainer = await canvas.findByTestId(
      'workflow-message-title',
    );
    const messageDescriptionContainer = await canvas.findByTestId(
      'workflow-message-description',
    );

    expect(messageTitleContainer).toBeVisible();
    expect(messageDescriptionContainer).toBeVisible();
  },
};
