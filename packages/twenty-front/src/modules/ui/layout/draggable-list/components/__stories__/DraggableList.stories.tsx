import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator, IconBell, MenuItemDraggable } from 'twenty-ui';

const meta: Meta<typeof DraggableList> = {
  title: 'UI/Layout/DraggableList/DraggableList',
  component: DraggableList,
  decorators: [ComponentDecorator],
  parameters: {
    onDragEnd: action('dragged'),
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
