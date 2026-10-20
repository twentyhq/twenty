import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsAdminChatToolCallPart } from '@/settings/admin-panel/components/SettingsAdminChatToolCallPart';
import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const TOOL_PART: AdminChatThreadMessagePart = {
  type: 'tool-inspect_tool',
  orderIndex: 0,
  toolName: 'inspect_tool',
  toolInput: '"Saved input"',
  toolOutput: '"Saved output"',
  state: 'output-available',
};

const meta: Meta<typeof SettingsAdminChatToolCallPart> = {
  title: 'Modules/Settings/AdminPanel/SettingsAdminChatToolCallPart',
  component: SettingsAdminChatToolCallPart,
  decorators: [ToastDecorator, ComponentDecorator],
  parameters: { container: { width: 500 } },
  args: { part: TOOL_PART },
};

export default meta;
type Story = StoryObj<typeof SettingsAdminChatToolCallPart>;

export const OutputAndInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup({ writeToClipboard: true });
    const toggle = canvas.getByRole('button', { name: 'inspect_tool' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle.tagName).toBe('BUTTON');
    await user.click(toggle);
    await user.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{Enter}');
    const panelId = toggle.getAttribute('aria-controls');
    assertIsDefinedOrThrow(panelId);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(canvasElement.ownerDocument.getElementById(panelId)).toBeVisible();
    });
    const output = await canvas.findByRole('tab', { name: 'Output' });
    const input = canvas.getByRole('tab', { name: 'Input' });
    await waitFor(() => {
      expect(output).toBeVisible();
      expect(output).toHaveAttribute('aria-selected', 'true');
      expect(
        canvas.getByRole('button', { name: 'Saved output' }),
      ).toBeVisible();
    });
    await user.click(canvas.getByRole('button', { name: 'Saved output' }));
    await waitFor(async () =>
      expect(await navigator.clipboard.readText()).toBe('Saved output'),
    );
    await user.click(output);
    await user.keyboard('{ArrowRight}');
    await expect(input).toHaveFocus();
    await expect(output).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(input).toHaveAttribute('aria-selected', 'true'));
    await expect(canvas.getByRole('tabpanel', { name: 'Input' })).toBeVisible();
    await user.click(canvas.getByRole('button', { name: 'Saved input' }));
    await waitFor(async () =>
      expect(await navigator.clipboard.readText()).toBe('Saved input'),
    );
    await user.click(toggle);
    await waitFor(() =>
      expect(canvas.queryByRole('tablist', { hidden: true })).toBeNull(),
    );
    await user.click(toggle);
    await waitFor(() => {
      const reopenedInput = canvas.getByRole('tab', { name: 'Input' });
      expect(reopenedInput).toBeVisible();
      expect(reopenedInput).toHaveAttribute('aria-selected', 'true');
      expect(canvas.getByRole('tabpanel', { name: 'Input' })).toBeVisible();
    });
  },
};

export const InputWithoutOutput: Story = {
  args: { part: { ...TOOL_PART, toolOutput: null, state: 'input-available' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'inspect_tool' }));
    const input = await canvas.findByRole('tab', { name: 'Input' });
    await waitFor(() => {
      expect(input).toBeVisible();
      expect(input).toHaveAttribute('aria-selected', 'true');
      expect(canvas.getByRole('button', { name: 'Saved input' })).toBeVisible();
    });
    await userEvent.click(canvas.getByRole('tab', { name: 'Output' }));
    await waitFor(() => expect(canvas.getByText('No output')).toBeVisible());
  },
};

export const ErrorWithTabs: Story = {
  args: {
    part: {
      ...TOOL_PART,
      state: 'output-error',
      errorMessage: 'Request failed',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'inspect_tool Failed' }),
    );
    const error = await canvas.findByText('Request failed');
    await waitFor(() => {
      expect(error).toBeVisible();
      expect(canvas.getByRole('tab', { name: 'Output' })).toBeVisible();
      expect(canvas.getByRole('tab', { name: 'Output' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
    await userEvent.click(canvas.getByRole('tab', { name: 'Input' }));
    await waitFor(() => {
      expect(canvas.getByRole('tabpanel', { name: 'Input' })).toBeVisible();
      expect(error).toBeVisible();
    });
  },
};
