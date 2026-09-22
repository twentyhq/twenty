import { DraggableListItem } from '@/ui/layout/draggable-list/components/DraggableListItem';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { IconBell } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

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
            <DraggableListItem icon={IconBell}>
              Non Draggable item 1
            </DraggableListItem>
          }
        />
        <DraggableItem
          draggableId="draggable-2"
          index={1}
          itemComponent={
            <DraggableListItem icon={IconBell}>
              Draggable item 2
            </DraggableListItem>
          }
        />
        <DraggableItem
          draggableId="draggable-3"
          index={2}
          itemComponent={
            <DraggableListItem icon={IconBell}>
              Draggable item 3
            </DraggableListItem>
          }
        />
      </>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof DraggableItem>;

export const Default: Story = {};
