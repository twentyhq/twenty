import { Meta, StoryObj } from '@storybook/react';

import { IconBell } from '@/ui/icon';
import { MenuItemDraggable } from '@/ui/menu-item/components/MenuItemDraggable';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { DraggableItem } from '../components/DraggableItem';
import { DroppableList } from '../components/DroppableList';

const meta: Meta<typeof DraggableItem> = {
  title: 'ui/draggable-list/DraggableItem',
  component: DraggableItem,
  decorators: [
    (Story, { parameters }) => (
      <DroppableList
        droppableId={parameters.droppableId}
        onDragEnd={parameters.onDragEnd}
        draggableItems={<Story />}
      />
    ),
    ComponentDecorator,
  ],
  parameters: {
    droppableId: 'droppable',
    onDragEnd: () => console.log('dragged'),
  },
  args: {
    draggableId: 'draggable-1',
    key: 'key-1',
    index: 0,
    isDragDisabled: false,
    itemComponent: (
      <>
        <MenuItemDraggable
          LeftIcon={IconBell}
          key="key-1"
          text="Draggable item 1"
        />
        <MenuItemDraggable
          LeftIcon={IconBell}
          key="key-2"
          text="Draggable item 2"
        />
      </>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof DraggableItem>;

export const Default: Story = {};
