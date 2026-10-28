import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconUnlink } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatThreadCompactRow } from '@/ai/components/AiChatThreadCompactRow';

const onDetach = fn();

const meta = {
  title: 'Modules/AI/AiChatThreadCompactRow',
  component: AiChatThreadCompactRow,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 368 } },
  args: {
    id: 'renewal',
    label: 'Cloud renewal prep',
    avatar: <Avatar name="Sarah" size="md" shape="circle" />,
    title: <Text color="primary">Cloud renewal prep</Text>,
    subtitle: (
      <Text color="tertiary" truncate>
        Sarah: Legal is reviewing the new terms
      </Text>
    ),
    activityTime: <Text color="secondary">3d</Text>,
    onClick: fn(),
    onContextMenu: fn(),
  },
} satisfies Meta<typeof AiChatThreadCompactRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Cloud renewal prep' });

    await expect(row.getBoundingClientRect().height).toBe(32);
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
    await userEvent.tab();
    await expect(row).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const HoverActions: Story = {
  args: {
    actions: (
      <LightIconButton aria-label="Detach" onClick={onDetach}>
        <IconUnlink />
      </LightIconButton>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Cloud renewal prep' });

    await trustedUserEvent.hover(row);
    const canHoverWithoutTouch = window.matchMedia(
      '(hover: hover) and (not (any-pointer: coarse))',
    ).matches;

    await expect(canvas.getByText('3d').getBoundingClientRect().width > 0).toBe(
      !canHoverWithoutTouch,
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Detach' }));
    await expect(onDetach).toHaveBeenCalledTimes(1);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(row.getBoundingClientRect().height).toBe(32);
  },
};

export const NarrowLongTitle: Story = {
  parameters: { container: { width: 288 } },
  args: {
    title: (
      <Text color="primary" truncate>
        Cloud renewal preparation for the international procurement team
      </Text>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Cloud renewal prep' });
    const time = canvas.getByText('3d');

    await expect(row.getBoundingClientRect().height).toBe(32);
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
    await expect(time).toBeVisible();
    await expect(time.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    );
  },
};

export const Editing: Story = {
  args: {
    isEditing: true,
    title: <Input aria-label="Rename chat" defaultValue="Cloud renewal prep" />,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Rename chat' });

    await userEvent.click(input);
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Streaming: Story = {
  args: { isStreaming: true, isSelected: true },
};
