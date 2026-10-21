import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconBell, IconEyeOff } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof DraggableItem> = {
  title: 'UI/Layout/DraggableList/DraggableItem',
  component: DraggableItem,
  decorators: [
    (Story) => <DraggableList onDragEnd={fn()} draggableItems={<Story />} />,
    ComponentDecorator,
  ],
  parameters: {
    container: { width: 100 },
  },
  argTypes: {
    itemComponent: { control: { disable: true } },
  },
  args: {
    draggableId: 'draggable-1',
    index: 0,
    isDragDisabled: false,
    itemComponent: (
      <DraggableListRow startIcon={<IconBell />}>
        Draggable item 1
      </DraggableListRow>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof DraggableItem>;

export const Default: Story = {};

const onRowAction = fn();
const onVisibilityChange = fn();

export const SiblingActionKeyboardOwnership: Story = {
  parameters: { container: { width: 320 } },
  args: {
    itemComponent: (
      <DraggableListRow
        startIcon={<IconBell />}
        dragHandleVisibility="hover"
        hasIconBackground
        onAction={onRowAction}
        actionsVisibility="always"
        actions={
          <LightIconButton aria-label="Hide field" onClick={onVisibilityChange}>
            <IconEyeOff />
          </LightIconButton>
        }
      >
        Company name
      </DraggableListRow>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rowAction = canvas.getByText('Company name', { selector: 'button' });
    const visibilityAction = canvas.getByRole('button', { name: 'Hide field' });

    onRowAction.mockClear();
    onVisibilityChange.mockClear();
    await expect(rowAction).toHaveAttribute('type', 'button');
    await expect(rowAction).not.toContainElement(visibilityAction);
    await userEvent.click(rowAction);
    await expect(onRowAction).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Enter}');
    await expect(onRowAction).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(' ');
    await expect(onRowAction).toHaveBeenCalledTimes(3);
    await userEvent.tab();
    await expect(visibilityAction).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onVisibilityChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    await expect(onVisibilityChange).toHaveBeenCalledTimes(2);
    await expect(onRowAction).toHaveBeenCalledTimes(3);
    await userEvent.tab({ shift: true });
    await expect(rowAction).toHaveFocus();
    const focusRing = getComputedStyle(rowAction, '::after');
    await expect(focusRing.outlineStyle).toBe('solid');
    await expect(focusRing.outlineWidth).toBe('2px');
  },
};
