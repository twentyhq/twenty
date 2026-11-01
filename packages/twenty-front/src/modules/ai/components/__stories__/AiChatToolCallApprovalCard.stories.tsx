import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { PUBLISH_FRONT_COMPONENT_TOOL_NAME } from 'twenty-shared/ai';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatToolCallApprovalCard } from '@/ai/components/AiChatToolCallApprovalCard';
import {
  frontComponentPreviewHandlers,
  seedFrontComponentPreviewWorkspace,
} from '@/ai/components/__mocks__/aiChatFrontComponentPreviewMocks';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const meta: Meta<typeof AiChatToolCallApprovalCard> = {
  title: 'Modules/AI/AiChatToolCallApprovalCard',
  component: AiChatToolCallApprovalCard,
  decorators: [
    RootDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
  beforeEach: () => seedFrontComponentPreviewWorkspace(),
  parameters: {
    container: { width: 600 },
    msw: { handlers: frontComponentPreviewHandlers },
  },
  args: {
    toolCallId: 'publish-call',
    proposal: {
      toolName: PUBLISH_FRONT_COMPONENT_TOOL_NAME,
      toolLabel: 'Publish Front Component',
      summary: 'Save this counter to the Workspace app',
      arguments: { draftId: 'current', checksum: 'a'.repeat(64) },
      template: 'generic',
      areArgumentsEditable: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatToolCallApprovalCard>;

export const ComponentPreview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Sample data')).toBeVisible();
    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Count: 0' },
        { timeout: 30000 },
      ),
    );
    await expect(
      await canvas.findByRole('button', { name: 'Count: 1' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('textbox', { name: 'Arguments' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Approve' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Reject' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Add feedback' }));
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Feedback' }),
      'Make it smaller',
    );
    await expect(
      canvas.getByRole('button', { name: 'Count: 1' }),
    ).toBeVisible();
  },
};
