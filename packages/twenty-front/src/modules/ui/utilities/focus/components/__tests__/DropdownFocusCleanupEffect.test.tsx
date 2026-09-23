import { DropdownFocusCleanupEffect } from '@/ui/utilities/focus/components/DropdownFocusCleanupEffect';
import { useDropdownFocus } from '@/ui/utilities/focus/hooks/useDropdownFocus';
import { currentGlobalHotkeysConfigSelector } from '@/ui/utilities/focus/states/currentGlobalHotkeysConfigSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useState } from 'react';

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

const DropdownOwner = ({ name }: { name: string }) => {
  const { focusId, updateDropdownFocus } = useDropdownFocus();

  return (
    <>
      <button onClick={() => updateDropdownFocus(true)}>Open {name}</button>
      <DropdownFocusCleanupEffect focusId={focusId} />
    </>
  );
};

const DropdownOwners = () => {
  const [isFirstOwnerVisible, setIsFirstOwnerVisible] = useState(true);

  return (
    <>
      {isFirstOwnerVisible && <DropdownOwner name="first dropdown" />}
      <DropdownOwner name="second dropdown" />
      <button onClick={() => setIsFirstOwnerVisible(false)}>
        Remove first owner
      </button>
    </>
  );
};

describe('DropdownFocusCleanupEffect', () => {
  it('removes only the unmounted owner while another dropdown remains open', async () => {
    const user = userEvent.setup();
    const store = createStore();

    store.set(focusStackState.atom, [BACKGROUND_FOCUS_ITEM]);

    const { unmount } = render(
      <JotaiProvider store={store}>
        <DropdownOwners />
      </JotaiProvider>,
    );

    await user.click(
      screen.getByRole('button', { name: 'Open first dropdown' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Open second dropdown' }),
    );

    expect(store.get(focusStackState.atom)).toHaveLength(3);

    const remainingFocusItem = store.get(focusStackState.atom).at(-1);

    await user.click(
      screen.getByRole('button', { name: 'Remove first owner' }),
    );

    expect(store.get(focusStackState.atom)).toEqual([
      BACKGROUND_FOCUS_ITEM,
      remainingFocusItem,
    ]);
    expect(store.get(currentGlobalHotkeysConfigSelector.atom)).toEqual({
      enableGlobalHotkeysConflictingWithKeyboard: false,
      enableGlobalHotkeysWithModifiers: false,
    });

    unmount();

    expect(store.get(focusStackState.atom)).toEqual([BACKGROUND_FOCUS_ITEM]);
    expect(store.get(currentGlobalHotkeysConfigSelector.atom)).toEqual(
      BACKGROUND_FOCUS_ITEM.globalHotkeysConfig,
    );
  });
});
