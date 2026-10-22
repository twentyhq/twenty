import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { type AgentRunToolCallLog } from 'twenty-shared/ai';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

import { WorkflowRunStepLogsToolCallRow } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowRunStepLogsToolCallRow';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const TOOL_CALL: AgentRunToolCallLog = {
  toolName: 'inspect_tool',
  toolCallId: 'inspect-tool-call',
  state: 'success',
  input: 'Saved input',
  output: 'Saved output',
};

const meta: Meta<typeof WorkflowRunStepLogsToolCallRow> = {
  title: 'Modules/Workflow/Actions/WorkflowRunStepLogsToolCallRow',
  component: WorkflowRunStepLogsToolCallRow,
  decorators: [ToastDecorator, ComponentDecorator],
  args: { toolCall: TOOL_CALL },
  parameters: {
    container: { width: 500 },
    msw: {
      handlers: [
        graphql.query('GetToolIndex', () =>
          HttpResponse.json({ data: { getToolIndex: [] } }),
        ),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowRunStepLogsToolCallRow>;

export const OutputAndInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup({ writeToClipboard: true });
    const toggle = canvas.getByRole('button', { name: /inspect_tool/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle.tagName).toBe('BUTTON');
    await user.click(toggle);
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

export const MissingOutput: Story = {
  args: { toolCall: { ...TOOL_CALL, output: undefined } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /inspect_tool/ }));
    const output = await canvas.findByRole('tab', { name: 'Output' });
    await waitFor(() => {
      expect(output).toBeVisible();
      expect(output).toHaveAttribute('aria-selected', 'true');
      expect(canvas.getByRole('button', { name: 'No output' })).toBeVisible();
    });
    await userEvent.click(canvas.getByRole('tab', { name: 'Input' }));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Saved input' })).toBeVisible(),
    );
  },
};

export const ErrorWithoutTabs: Story = {
  args: {
    toolCall: { ...TOOL_CALL, state: 'error', errorMessage: 'Request failed' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /inspect_tool/ }));
    const error = await canvas.findByText('Request failed');
    await waitFor(() => {
      expect(error).toBeVisible();
      expect(canvas.queryByRole('tablist', { hidden: true })).toBeNull();
    });
  },
};

export const NoDetails: Story = {
  args: {
    toolCall: { ...TOOL_CALL, input: undefined, output: undefined },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('inspect_tool')).toBeVisible();
    expect(canvas.queryByRole('button')).toBeNull();
    expect(canvas.queryByRole('tablist', { hidden: true })).toBeNull();
  },
};
