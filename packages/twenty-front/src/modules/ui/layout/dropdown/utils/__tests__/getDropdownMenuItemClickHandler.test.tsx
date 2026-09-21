import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type MouseEvent } from 'react';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';

describe('dropdown ListItem clicks', () => {
  it('cancels parent navigation before invoking the action with its event', async () => {
    const user = userEvent.setup();
    const onParentClick = jest.fn();
    const onAction = jest.fn((event: MouseEvent<HTMLDivElement>) => {
      expect(event.defaultPrevented).toBe(true);
      expect(event.currentTarget).toHaveTextContent('Archive');
    });

    render(
      <a href="#record" onClick={onParentClick}>
        <ListItem onClick={getDropdownMenuItemClickHandler(onAction)}>
          Archive
        </ListItem>
      </a>,
    );

    await user.click(screen.getByText('Archive'));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('allows a row without an action to activate its containing trigger', async () => {
    const user = userEvent.setup();
    const onTriggerClick = jest.fn();

    render(
      <div onClick={onTriggerClick}>
        <ListItem onClick={getDropdownMenuItemClickHandler(undefined)}>
          Open menu
        </ListItem>
      </div>,
    );

    await user.click(screen.getByText('Open menu'));

    expect(onTriggerClick).toHaveBeenCalledTimes(1);
  });

  it('keeps disabled actions inactive without stopping propagation', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    const onParentClick = jest.fn();

    render(
      <div onClick={onParentClick}>
        <ListItem disabled onClick={getDropdownMenuItemClickHandler(onAction)}>
          Delete
        </ListItem>
      </div>,
    );

    await user.click(screen.getByText('Delete'));

    expect(onAction).not.toHaveBeenCalled();
    expect(onParentClick).toHaveBeenCalledTimes(1);
  });
});
