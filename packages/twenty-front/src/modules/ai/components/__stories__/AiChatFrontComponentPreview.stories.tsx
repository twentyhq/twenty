import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatFrontComponentPreview } from '@/ai/components/AiChatFrontComponentPreview';
import {
  frontComponentPreviewHandlers,
  seedFrontComponentPreviewWorkspace,
} from '@/ai/components/__mocks__/aiChatFrontComponentPreviewMocks';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const meta: Meta<typeof AiChatFrontComponentPreview> = {
  title: 'Modules/AI/AiChatFrontComponentPreview',
  component: AiChatFrontComponentPreview,
  decorators: [RootDecorator, ComponentDecorator],
  beforeEach: () => seedFrontComponentPreviewWorkspace(),
  args: { draftId: 'current' },
  parameters: {
    container: { width: 500 },
    msw: { handlers: frontComponentPreviewHandlers },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatFrontComponentPreview>;

export const InteractivePreview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('region', {
        name: 'Component preview with sample data',
      }),
    ).toBeVisible();
    await expect(canvas.getByText('Sample data')).toBeVisible();
    await expect(canvas.getByText('Dashboard widget')).toBeVisible();
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
    await waitFor(() =>
      expect(canvas.queryByRole('status')).not.toBeInTheDocument(),
    );
  },
};

export const RecordPage: Story = {
  args: { draftId: 'record-page' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Record page widget'),
    ).toBeVisible();
  },
};

export const Saved: Story = {
  args: { draftId: 'saved' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Saved to Workspace app'),
    ).toBeVisible();
  },
};

export const Superseded: Story = {
  args: { draftId: 'superseded' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'A newer revision exists. Open the latest preview to save.',
      ),
    ).toBeVisible();
  },
};

export const Unavailable: Story = {
  args: { draftId: 'unavailable' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('alert'),
    ).toHaveTextContent('Could not load preview.');
  },
};

export const RuntimeError: Story = {
  args: { draftId: 'runtime-error' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('alert', {}, { timeout: 30000 }),
    ).toHaveTextContent('Component crashed.');
  },
};

export const Disabled: Story = {
  beforeEach: () => seedFrontComponentPreviewWorkspace(false),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText('Sample data'),
    ).not.toBeInTheDocument();
  },
};
