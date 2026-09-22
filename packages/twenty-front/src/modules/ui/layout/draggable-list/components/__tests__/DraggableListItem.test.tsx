import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from 'twenty-ui/primitives/input';
import { DraggableListItem } from '@/ui/layout/draggable-list/components/DraggableListItem';

it('keeps actions available when dragging is disabled and preserves bubbling', async () => {
  const user = userEvent.setup();
  const onVisibilityChange = jest.fn();
  const onRowClick = jest.fn();
  const onParentClick = jest.fn();
  render(
    <div onClick={onParentClick}>
      <DraggableListItem
        grip="always"
        dragDisabled
        placeholder
        onClick={onRowClick}
        actions={<Button onClick={onVisibilityChange}>Show field</Button>}
      >
        Hidden field
      </DraggableListItem>
    </div>,
  );
  await user.click(screen.getByRole('button', { name: 'Show field' }));
  expect(onVisibilityChange).toHaveBeenCalledTimes(1);
  expect(onRowClick).toHaveBeenCalledTimes(1);
  expect(onParentClick).toHaveBeenCalledTimes(1);
});

it('lets an action stop propagation without selecting its row', async () => {
  const user = userEvent.setup();
  const onRowClick = jest.fn();
  render(
    <DraggableListItem
      onClick={onRowClick}
      actions={
        <Button onClick={(event) => event.stopPropagation()}>Remove</Button>
      }
    >
      Field
    </DraggableListItem>,
  );
  await user.click(screen.getByRole('button', { name: 'Remove' }));
  expect(onRowClick).not.toHaveBeenCalled();
});
