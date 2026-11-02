import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconBell, IconEyeOff } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof DraggableList> = {
  title: 'UI/Layout/DraggableList/DraggableList',
  component: DraggableList,
  decorators: [ComponentDecorator],
  argTypes: {
    draggableItems: { control: false },
  },
  args: {
    onDragEnd: fn(),
    draggableItems: (
      <>
        <DraggableItem
          draggableId="draggable-1"
          index={0}
          isDragDisabled={false}
          itemComponent={
            <DraggableListRow startIcon={<IconBell />}>
              Draggable item 1
            </DraggableListRow>
          }
        />
        <DraggableItem
          draggableId="draggable-2"
          index={1}
          itemComponent={
            <DraggableListRow startIcon={<IconBell />}>
              Draggable item 2
            </DraggableListRow>
          }
        />
        <DraggableItem
          draggableId="draggable-3"
          index={2}
          itemComponent={
            <DraggableListRow startIcon={<IconBell />}>
              Draggable item 3
            </DraggableListRow>
          }
        />
      </>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof DraggableList>;

export const Default: Story = {};

export const KeyboardReorder: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const firstItem = await canvas.findByRole('button', {
      name: 'Draggable item 1',
    });

    await userEvent.tab();
    await expect(firstItem).toHaveFocus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await userEvent.keyboard(' ');
    await expect(args.onDragEnd).toHaveBeenCalledTimes(1);
    await expect(args.onDragEnd).toHaveBeenCalledWith({
      draggableId: 'draggable-1',
      source: { index: 0 },
      destination: { index: 1 },
    });
  },
};

const onRowAction = fn();
const onVisibilityChange = fn();

export const PointerGripReorder: Story = {
  parameters: { container: { width: 320 } },
  args: {
    draggableItems: (
      <>
        <DraggableItem
          draggableId="draggable-1"
          index={0}
          itemComponent={
            <DraggableListRow
              startIcon={<IconBell />}
              dragHandleVisibility="hover"
              hasIconBackground
              onAction={onRowAction}
              actionsVisibility="always"
              actions={
                <LightIconButton
                  aria-label="Hide field"
                  onClick={onVisibilityChange}
                >
                  <IconEyeOff />
                </LightIconButton>
              }
            >
              Company name
            </DraggableListRow>
          }
        />
        <DraggableItem
          draggableId="draggable-2"
          index={1}
          itemComponent={
            <DraggableListRow startIcon={<IconBell />}>Phone</DraggableListRow>
          }
        />
      </>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const pointerUser = userEvent.setup();
    const rowAction = canvas
      .getAllByRole('button', { name: 'Company name' })
      .find((button) => button instanceof HTMLButtonElement);

    if (!isDefined(rowAction)) {
      throw new Error('The row action must be a native button');
    }

    const firstItem = await waitFor(() => {
      const dragHost = rowAction.closest('[aria-roledescription="draggable"]');

      if (!(dragHost instanceof HTMLElement)) {
        throw new Error('The row action must stay inside its drag host');
      }

      return dragHost;
    });
    const secondItem = canvas.getByRole('button', { name: 'Phone' });
    const firstBounds = firstItem.getBoundingClientRect();
    const secondBounds = secondItem.getBoundingClientRect();
    const clientX = firstBounds.left + 16;
    const clientY = firstBounds.top + firstBounds.height / 2;
    const dragSurface = canvasElement.ownerDocument.elementFromPoint(
      clientX,
      clientY,
    );

    if (
      !isDefined(dragSurface) ||
      (!(dragSurface instanceof HTMLElement) &&
        !(dragSurface instanceof SVGElement))
    ) {
      throw new Error('The drag grip must have a pointer target');
    }

    onRowAction.mockClear();
    onVisibilityChange.mockClear();
    await expect(rowAction).not.toContainElement(dragSurface);
    await pointerUser.pointer([
      {
        target: dragSurface,
        keys: '[MouseLeft>]',
        coords: { clientX, clientY },
      },
      {
        target: dragSurface,
        coords: { clientX, clientY: clientY + 12 },
      },
    ]);
    await waitFor(() =>
      expect(firstItem).toHaveAttribute('aria-grabbed', 'true'),
    );
    await pointerUser.pointer([
      {
        target: secondItem,
        coords: { clientX, clientY: secondBounds.bottom - 4 },
      },
    ]);
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).getByRole('status'),
      ).toHaveTextContent(
        'Draggable item draggable-1 was moved over droppable target draggable-2.',
      ),
    );
    await pointerUser.pointer({ target: secondItem, keys: '[/MouseLeft]' });
    await waitFor(() => expect(args.onDragEnd).toHaveBeenCalledTimes(1));
    await expect(args.onDragEnd).toHaveBeenCalledWith({
      draggableId: 'draggable-1',
      source: { index: 0 },
      destination: { index: 1 },
    });
    await expect(onRowAction).not.toHaveBeenCalled();
    await expect(onVisibilityChange).not.toHaveBeenCalled();
  },
};
