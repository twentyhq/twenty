import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator, IconBell, MenuItemDraggable } from 'twenty-ui';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';

const meta: Meta<typeof DraggableItem> = {
  title: 'UI/Layout/DraggableList/DraggableItem',
  component: DraggableItem,
  decorators: [
    (Story) => (
      <DragDropContext onDragEnd={() => jest.fn()}>
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
