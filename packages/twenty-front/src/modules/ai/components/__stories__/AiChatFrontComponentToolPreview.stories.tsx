import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { PREVIEW_FRONT_COMPONENT_TOOL_NAME } from 'twenty-shared/ai';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatFrontComponentToolPreview } from '@/ai/components/AiChatFrontComponentToolPreview';
import {
  frontComponentPreviewHandlers,
  seedFrontComponentPreviewWorkspace,
} from '@/ai/components/__mocks__/aiChatFrontComponentPreviewMocks';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const meta: Meta<typeof AiChatFrontComponentToolPreview> = {
  title: 'Modules/AI/AiChatFrontComponentToolPreview',
  component: AiChatFrontComponentToolPreview,
  decorators: [
    RootDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
  beforeEach: () => seedFrontComponentPreviewWorkspace(),
  parameters: {
    container: { width: 500 },
    msw: { handlers: frontComponentPreviewHandlers },
  },
  args: {
    isStreaming: false,
    toolPart: {
      type: `tool-${PREVIEW_FRONT_COMPONENT_TOOL_NAME}`,
      toolCallId: 'preview-call',
      state: 'output-available',
      input: {},
      output: { success: true, result: { draftId: 'current' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatFrontComponentToolPreview>;

export const SuccessfulPreview: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('region', {
        name: 'Component preview with sample data',
      }),
    ).toBeVisible();
  },
};

export const FailedPreview: Story = {
  args: {
    toolPart: {
      type: `tool-${PREVIEW_FRONT_COMPONENT_TOOL_NAME}`,
      toolCallId: 'failed-preview',
      state: 'output-available',
      input: {},
      output: { success: false, error: 'Could not compile component.' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('button')).toBeVisible();
    await expect(canvas.queryByText('Sample data')).not.toBeInTheDocument();
  },
};

export const MalformedPreview: Story = {
  args: {
    toolPart: {
      type: `tool-${PREVIEW_FRONT_COMPONENT_TOOL_NAME}`,
      toolCallId: 'malformed-preview',
      state: 'output-available',
      input: {},
      output: { success: true, result: { draftId: 42 } },
    },
  },
  play: FailedPreview.play,
};

export const EmptyDraftId: Story = {
  args: {
    toolPart: {
      type: `tool-${PREVIEW_FRONT_COMPONENT_TOOL_NAME}`,
      toolCallId: 'empty-draft-preview',
      state: 'output-available',
      input: {},
      output: { success: true, result: { draftId: '' } },
    },
  },
  play: FailedPreview.play,
};
