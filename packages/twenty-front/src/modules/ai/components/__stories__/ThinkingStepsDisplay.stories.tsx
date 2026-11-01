import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ThinkingStepsDisplay } from '@/ai/components/ThinkingStepsDisplay';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const meta: Meta<typeof ThinkingStepsDisplay> = {
  title: 'Modules/AI/ThinkingStepsDisplay',
  component: ThinkingStepsDisplay,
  decorators: [ToastDecorator, MemoryRouterDecorator, ComponentDecorator],
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
  args: {
    isLastMessageStreaming: false,
    parts: [
      { type: 'reasoning', state: 'done', text: 'Reviewed the request.' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ThinkingStepsDisplay>;

export const SummaryDisclosure: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: '1 step' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByText('Thought')).toBeNull();
    await userEvent.tab();
    expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const panelId = toggle.getAttribute('aria-controls');
    assertIsDefinedOrThrow(panelId);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(canvasElement.ownerDocument.getElementById(panelId)).toBeVisible();
      expect(canvas.getByText('Thought')).toBeVisible();
    });
    await userEvent.keyboard(' ');
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(canvas.queryByText('Thought')).toBeNull();
    });
  },
};

export const WhileWorking: Story = {
  args: {
    isLastMessageStreaming: true,
    isTrailingWhileStreaming: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: 'Thinking' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(canvas.queryByText('Thought')).toBeNull();
  },
};

export const ToolDisclosure: Story = {
  args: {
    parts: [
      {
        type: 'dynamic-tool',
        toolName: 'inspect_tool',
        toolCallId: 'inspect-tool-call',
        state: 'output-available',
        input: 'Saved input',
        output: 'Saved output',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '1 step' }));
    const toggle = await canvas.findByRole('button', { name: /inspect_tool/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    const panelId = toggle.getAttribute('aria-controls');
    assertIsDefinedOrThrow(panelId);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(canvasElement.ownerDocument.getElementById(panelId)).toBeVisible();
      expect(
        canvas.getByRole('button', { name: 'Saved output' }),
      ).toBeVisible();
    });
    await userEvent.keyboard(' ');
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(canvas.queryByRole('button', { name: 'Saved output' })).toBeNull();
    });
  },
};
