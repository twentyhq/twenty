import { WorkflowOutputSchemaFieldHeader } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowOutputSchemaFieldHeader';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof WorkflowOutputSchemaFieldHeader> = {
  title: 'Modules/Workflow/WorkflowOutputSchemaFieldHeader',
  component: WorkflowOutputSchemaFieldHeader,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320 } },
  args: {
    name: 'Summary',
    isExpanded: true,
    onToggle: fn(),
    onRemove: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowOutputSchemaFieldHeader>;

export const KeyboardExpansion: Story = {
  render: function Render(args) {
    const [isExpanded, setIsExpanded] = useState(args.isExpanded);

    return (
      <WorkflowOutputSchemaFieldHeader
        {...args}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Summary' });

    await expect(toggle).toHaveAttribute('type', 'button');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle.getBoundingClientRect().height).toBe(32);
    toggle.focus();
    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Remove output field' }),
    ).toHaveFocus();
  },
};

export const RemoveWithoutToggling: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole('button', { name: 'Remove output field' });

    await userEvent.click(remove);
    await expect(args.onRemove).toHaveBeenCalledOnce();
    await expect(args.onToggle).not.toHaveBeenCalled();
    await expect(remove.getBoundingClientRect().width).toBe(24);
  },
};

export const ReadOnly: Story = {
  args: { name: '', onRemove: undefined },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Untitled field' }),
    );
    await expect(args.onToggle).toHaveBeenCalledOnce();
  },
};
