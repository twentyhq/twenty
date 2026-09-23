import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdownRoot } from '@/ui/layout/dropdown/hooks/useCloseDropdownRoot';
import { useIsDropdownRootOpen } from '@/ui/layout/dropdown/hooks/useIsDropdownRootOpen';
import { currentGlobalHotkeysConfigSelector } from '@/ui/utilities/focus/states/currentGlobalHotkeysConfigSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { Dropdown } from 'twenty-ui/components';

const BACKGROUND_FOCUS_ITEM: FocusStackItem = {
  focusId: 'record-page',
  componentInstance: {
    componentType: FocusComponentType.PAGE,
    componentInstanceId: 'record-page',
  },
  globalHotkeysConfig: {
    enableGlobalHotkeysConflictingWithKeyboard: true,
    enableGlobalHotkeysWithModifiers: true,
  },
};

const DROPDOWN_HOTKEYS_CONFIG = {
  enableGlobalHotkeysConflictingWithKeyboard: false,
  enableGlobalHotkeysWithModifiers: false,
};

const createTestStore = () => {
  const store = createStore();

  store.set(focusStackState.atom, [BACKGROUND_FOCUS_ITEM]);

  return store;
};

const DropdownOpenState = () => {
  const isDropdownOpen = useIsDropdownRootOpen();

  return (
    <output aria-label="Dropdown state">
      {isDropdownOpen ? 'Open' : 'Closed'}
    </output>
  );
};

const SaveButton = () => {
  const { closeDropdown } = useCloseDropdownRoot();

  return <button onClick={closeDropdown}>Save</button>;
};

const DropdownOwners = ({
  isInnerOwnerVisible,
}: {
  isInnerOwnerVisible: boolean;
}) => (
  <DropdownRoot type="panel">
    <Dropdown.Trigger>Outer dropdown</Dropdown.Trigger>
    <Dropdown.Content aria-label="Outer dropdown">
      {isInnerOwnerVisible && (
        <DropdownRoot type="panel">
          <Dropdown.Trigger>Inner dropdown</Dropdown.Trigger>
          <Dropdown.Content aria-label="Inner dropdown">
            Inner content
          </Dropdown.Content>
        </DropdownRoot>
      )}
    </Dropdown.Content>
  </DropdownRoot>
);

describe('DropdownRoot', () => {
  it('updates focus and global shortcuts before notifying opening and dismissal', async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    const onOpenChange = jest.fn((open: boolean) => ({
      open,
      focusStack: store.get(focusStackState.atom),
      globalHotkeysConfig: store.get(currentGlobalHotkeysConfigSelector.atom),
    }));

    render(
      <JotaiProvider store={store}>
        <DropdownRoot type="menu" onOpenChange={onOpenChange}>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Actions">
            <Dropdown.ActionItem>Archive</Dropdown.ActionItem>
          </Dropdown.Content>
        </DropdownRoot>
      </JotaiProvider>,
    );

    expect(store.get(focusStackState.atom)).toEqual([BACKGROUND_FOCUS_ITEM]);

    const trigger = screen.getByRole('button', { name: 'Actions' });

    await user.click(trigger);

    expect(screen.getByRole('menu', { name: 'Actions' })).toBeVisible();
    expect(onOpenChange).toHaveLastReturnedWith({
      open: true,
      focusStack: [
        BACKGROUND_FOCUS_ITEM,
        {
          focusId: expect.any(String),
          componentInstance: {
            componentType: FocusComponentType.DROPDOWN,
            componentInstanceId: expect.any(String),
          },
          globalHotkeysConfig: DROPDOWN_HOTKEYS_CONFIG,
        },
      ],
      globalHotkeysConfig: DROPDOWN_HOTKEYS_CONFIG,
    });

    const openedFocusStack = store.get(focusStackState.atom);

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveLastReturnedWith({
      open: false,
      focusStack: [BACKGROUND_FOCUS_ITEM],
      globalHotkeysConfig: BACKGROUND_FOCUS_ITEM.globalHotkeysConfig,
    });
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());

    await user.click(trigger);

    expect(store.get(focusStackState.atom)).toEqual(openedFocusStack);
  });

  it('closes the popup and restores focus through the close hook', async () => {
    const user = userEvent.setup();
    const store = createTestStore();

    render(
      <JotaiProvider store={store}>
        <DropdownRoot type="panel">
          <Dropdown.Trigger>Edit record</Dropdown.Trigger>
          <DropdownOpenState />
          <Dropdown.Content aria-label="Edit record">
            <SaveButton />
          </Dropdown.Content>
        </DropdownRoot>
      </JotaiProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Edit record' });
    const dropdownState = screen.getByRole('status', {
      name: 'Dropdown state',
    });

    expect(dropdownState).toHaveTextContent('Closed');

    await user.click(trigger);

    expect(dropdownState).toHaveTextContent('Open');
    expect(screen.getByRole('dialog', { name: 'Edit record' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(dropdownState).toHaveTextContent('Closed');
    expect(store.get(focusStackState.atom)).toEqual([BACKGROUND_FOCUS_ITEM]);
    expect(store.get(currentGlobalHotkeysConfigSelector.atom)).toEqual(
      BACKGROUND_FOCUS_ITEM.globalHotkeysConfig,
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('removes the unmounted inner owner while the outer dropdown remains open', async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    const { rerender, unmount } = render(
      <JotaiProvider store={store}>
        <DropdownOwners isInnerOwnerVisible />
      </JotaiProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Outer dropdown' }));

    const remainingFocusItem = store.get(focusStackState.atom).at(-1);

    await user.click(screen.getByRole('button', { name: 'Inner dropdown' }));

    expect(store.get(focusStackState.atom)).toHaveLength(3);

    rerender(
      <JotaiProvider store={store}>
        <DropdownOwners isInnerOwnerVisible={false} />
      </JotaiProvider>,
    );

    expect(store.get(focusStackState.atom)).toEqual([
      BACKGROUND_FOCUS_ITEM,
      remainingFocusItem,
    ]);
    expect(
      screen.getByRole('button', { name: 'Outer dropdown' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('dialog', { name: 'Outer dropdown' }),
    ).toBeVisible();
    expect(store.get(currentGlobalHotkeysConfigSelector.atom)).toEqual(
      DROPDOWN_HOTKEYS_CONFIG,
    );

    unmount();

    expect(store.get(focusStackState.atom)).toEqual([BACKGROUND_FOCUS_ITEM]);
    expect(store.get(currentGlobalHotkeysConfigSelector.atom)).toEqual(
      BACKGROUND_FOCUS_ITEM.globalHotkeysConfig,
    );
  });
});
