import { Meta, StoryObj } from '@storybook/react';

import { IconBell } from '@/ui/icon';
import { MenuItemDraggable } from '@/ui/menu-item/components/MenuItemDraggable';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { DraggableItem } from '../components/DraggableItem';
import { DraggableList } from '../components/DraggableList';

const meta: Meta<typeof DraggableList> = {
  title: 'UI/DraggableList/DraggableList',
  component: DraggableList,
  decorators: [ComponentDecorator],
  parameters: {
    onDragEnd: () => console.log('dragged'),
  },
  argTypes: {
    draggableItems: { control: false },
  },
  args: {
    draggableItems: (
      <>
        <DraggableItem
          draggableId="draggable-1"
          index={0}
          isDragDisabled={false}
          itemComponent={
            <MenuItemDraggable
              LeftIcon={IconBell}
              text="Non Draggable item 1"
            />
          }
        />
        <DraggableItem
          draggableId="draggable-2"
          index={1}
          itemComponent={
            <MenuItemDraggable LeftIcon={IconBell} text="Draggable item 2" />
          }
        />
        <DraggableItem
          draggableId="draggable-3"
          index={2}
          itemComponent={
            <MenuItemDraggable LeftIcon={IconBell} text="Draggable item 3" />
          }
        />
      </>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof DraggableItem>;

export const Default: Story = {};
