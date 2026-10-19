import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconBell, IconEyeOff } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const onVisibilityChange = fn();

const meta: Meta<typeof DraggableListRow> = {
  title: 'UI/Layout/DraggableList/DraggableListRow',
  component: DraggableListRow,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320 } },
  args: {
    children: 'Company name',
    startIcon: <IconBell />,
    dragHandleVisibility: 'always',
    actionsVisibility: 'always',
    actions: (
      <LightIconButton aria-label="Hide field" onClick={onVisibilityChange}>
        <IconEyeOff />
      </LightIconButton>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof DraggableListRow>;

export const PresentationalRow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Hide field' });

    onVisibilityChange.mockClear();
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    await userEvent.tab();
    await expect(action).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onVisibilityChange).toHaveBeenCalledTimes(1);
  },
};

export const DisabledPrimaryAction: Story = {
  args: { onAction: fn(), actionDisabled: true, isDragDisabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const rowAction = canvas.getByRole('button', { name: 'Company name' });
    const visibilityAction = canvas.getByRole('button', { name: 'Hide field' });

    onVisibilityChange.mockClear();
    await expect(rowAction).toBeDisabled();
    await expect(visibilityAction).toBeEnabled();
    await userEvent.click(visibilityAction);
    await expect(onVisibilityChange).toHaveBeenCalledTimes(1);
    await expect(args.onAction).not.toHaveBeenCalled();
  },
};
