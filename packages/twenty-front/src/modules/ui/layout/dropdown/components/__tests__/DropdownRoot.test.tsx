import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { previousDropdownFocusIdStackState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdStackState';
import { currentGlobalHotkeysConfigSelector } from '@/ui/utilities/focus/states/currentGlobalHotkeysConfigSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
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
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
  );

  return (
    <output aria-label="Dropdown state">
      {isDropdownOpen ? 'Open' : 'Closed'}
    </output>
  );
};

const SaveButton = () => {
  const { closeDropdown } = useCloseDropdown();

  return <button onClick={() => closeDropdown()}>Save</button>;
};

const DropdownOwners = ({
  isInnerOwnerVisible,
}: {
  isInnerOwnerVisible: boolean;
}) => (
  <DropdownRoot dropdownId="outer-dropdown" type="panel">
    <Dropdown.Trigger>Outer dropdown</Dropdown.Trigger>
    <Dropdown.Content aria-label="Outer dropdown">
      {isInnerOwnerVisible && (
        <DropdownRoot dropdownId="inner-dropdown" type="panel">
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
        <DropdownRoot
          dropdownId="actions-dropdown"
          type="menu"
          onOpenChange={onOpenChange}
        >
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
          focusId: 'actions-dropdown',
          componentInstance: {
            componentType: FocusComponentType.DROPDOWN,
            componentInstanceId: 'actions-dropdown',
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
        <DropdownRoot dropdownId="edit-record-dropdown" type="panel">
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

  it('opens and closes the declared dropdown through external hooks', async () => {
    const store = createTestStore();
    const onOpenChange = jest.fn();
    const { result } = renderHook(
      () => ({ ...useOpenDropdown(), ...useCloseDropdown() }),
      {
        wrapper: ({ children }) => (
          <JotaiProvider store={store}>{children}</JotaiProvider>
        ),
      },
    );

    render(
      <JotaiProvider store={store}>
        <DropdownRoot
          dropdownId="external-dropdown"
          type="menu"
          onOpenChange={onOpenChange}
        >
          <Dropdown.Trigger>External actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="External actions">
            <Dropdown.ActionItem>Archive</Dropdown.ActionItem>
          </Dropdown.Content>
        </DropdownRoot>
        <DropdownRoot dropdownId="other-dropdown" type="menu">
          <Dropdown.Trigger>Other actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Other actions">
            <Dropdown.ActionItem>Rename</Dropdown.ActionItem>
          </Dropdown.Content>
        </DropdownRoot>
      </JotaiProvider>,
    );

    act(() => {
      result.current.openDropdown({
        dropdownComponentInstanceIdFromProps: 'external-dropdown',
      });
    });

    await waitFor(() =>
      expect(
        screen.getByRole('menu', { name: 'External actions' }),
      ).toBeVisible(),
    );
    expect(
      screen.queryByRole('menu', { name: 'Other actions' }),
    ).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(store.get(activeDropdownFocusIdState.atom)).toBe(
      'external-dropdown',
    );

    act(() => {
      result.current.closeDropdown('external-dropdown');
    });

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(store.get(focusStackState.atom)).toEqual([BACKGROUND_FOCUS_ITEM]);
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('remounts a declared dropdown closed after its open owner unmounts', async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    const dropdown = (
      <JotaiProvider store={store}>
        <DropdownRoot dropdownId="remounted-dropdown" type="menu">
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Actions">
            <Dropdown.ActionItem>Archive</Dropdown.ActionItem>
          </Dropdown.Content>
        </DropdownRoot>
      </JotaiProvider>
    );
    const { unmount } = render(dropdown);

    await user.click(screen.getByRole('button', { name: 'Actions' }));

    expect(screen.getByRole('menu', { name: 'Actions' })).toBeVisible();

    unmount();

    expect(
      store.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId: 'remounted-dropdown',
        }),
      ),
    ).toBe(false);
    expect(store.get(activeDropdownFocusIdState.atom)).toBeNull();
    expect(store.get(previousDropdownFocusIdStackState.atom)).toEqual([]);
    expect(store.get(focusStackState.atom)).toEqual([BACKGROUND_FOCUS_ITEM]);

    render(dropdown);

    expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Actions' }));

    expect(screen.getByRole('menu', { name: 'Actions' })).toBeVisible();
    expect(store.get(focusStackState.atom)).toHaveLength(2);
  });
});
