import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type MouseEvent } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';

import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';

describe('MenuItemWithOptionDropdown', () => {
  it('activates the main native button with Enter and Space and preserves its explicit event boundary', async () => {
    const user = userEvent.setup();
    const onParentClick = jest.fn();
    const onClick = jest.fn((event: MouseEvent<HTMLButtonElement>) => ({
      tagName: event.currentTarget.tagName,
      defaultPrevented: event.defaultPrevented,
    }));

    render(
      <Provider store={createStore()}>
        <div onClick={onParentClick}>
          <MenuItemWithOptionDropdown
            dropdownId="main-action-options"
            text="Current view"
            onClick={onClick}
            dropdownContent={<Dropdown.ActionItem>Rename</Dropdown.ActionItem>}
          />
        </div>
      </Provider>,
    );

    const mainButton = screen.getByRole('button', { name: 'Current view' });

    mainButton.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveLastReturnedWith({
      tagName: 'BUTTON',
      defaultPrevented: true,
    });
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('opens the trailing menu and activates its item without activating the main button or its ancestor', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const onRename = jest.fn();
    const onParentClick = jest.fn();

    render(
      <Provider store={createStore()}>
        <div onClick={onParentClick}>
          <MenuItemWithOptionDropdown
            dropdownId="trailing-action-options"
            text="Current view"
            onClick={onClick}
            dropdownContent={
              <Dropdown.ActionItem onClick={onRename}>
                Rename
              </Dropdown.ActionItem>
            }
          />
        </div>
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: 'More options' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));

    expect(onRename).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('keeps caller-provided links as explicit content when there is no main action', () => {
    render(
      <Provider store={createStore()}>
        <MenuItemWithOptionDropdown
          dropdownId="link-options"
          text={<a href="https://twenty.com">Documentation</a>}
          dropdownContent={<Dropdown.ActionItem>Copy</Dropdown.ActionItem>}
        />
      </Provider>,
    );

    const link = screen.getByRole('link', { name: 'Documentation' });

    expect(link).toHaveAttribute('href', 'https://twenty.com');
    expect(link.closest('button')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
