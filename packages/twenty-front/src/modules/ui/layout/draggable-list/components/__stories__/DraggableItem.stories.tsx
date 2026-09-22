import { DraggableListItem } from '@/ui/layout/draggable-list/components/DraggableListItem';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { IconBell } from 'twenty-ui/icon';
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
      <DraggableListItem icon={IconBell}>Draggable item 1</DraggableListItem>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof DraggableItem>;

export const Default: Story = {};
