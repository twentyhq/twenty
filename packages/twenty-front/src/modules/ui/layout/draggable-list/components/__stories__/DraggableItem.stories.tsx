import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { type Meta, type StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { IconBell } from 'twenty-ui/display';
import { MenuItemDraggable } from 'twenty-ui/navigation';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof DraggableItem> = {
  title: 'UI/Layout/DraggableList/DraggableItem',
  component: DraggableItem,
  decorators: [
    (Story) => (
      <DragDropContext onDragEnd={fn()}>
        <Droppable droppableId="droppable-id">
          {(_provided) => <Story />}
        </Droppable>
      </DragDropContext>
    ),
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
      <MenuItemDraggable LeftIcon={IconBell} text="Draggable item 1" />
    ),
  },
};

export default meta;

type Story = StoryObj<typeof DraggableItem>;

export const Default: Story = {};
