import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowFormEmptyMessage } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormEmptyMessage';

const meta: Meta<typeof WorkflowFormEmptyMessage> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowFormEmptyMessage',
  component: WorkflowFormEmptyMessage,
  parameters: {
    layout: 'centered',
  },
  decorators: [I18nFrontDecorator],
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
