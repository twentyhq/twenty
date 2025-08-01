import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { isCommandMenuPersistentState } from '@/command-menu/states/isCommandMenuPersistentState';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <MemoryRouter
      initialEntries={['/one', '/two', { pathname: '/three' }]}
      initialIndex={1}
    >
      {children}
    </MemoryRouter>
  </RecoilRoot>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const commandMenu = useCommandMenu();
      const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
      const isCommandMenuPersistent = useRecoilValue(
        isCommandMenuPersistentState,
      );
      const commandMenuNavigationStack = useRecoilValue(
        commandMenuNavigationStackState,
      );
      const commandMenuPage = useRecoilValue(commandMenuPageState);
      const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);

      return {
        commandMenu,
        isCommandMenuOpened,
        isCommandMenuPersistent,
        commandMenuNavigationStack,
        commandMenuPage,
        commandMenuPageInfo,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
  return { result };
};

describe('useCommandMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open and close the command menu', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.openCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(true);

    act(() => {
      result.current.commandMenu.closeCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(false);
  });

  it('should toggle the command menu', () => {
    const { result } = renderHooks();

    expect(result.current.isCommandMenuOpened).toBe(false);

    act(() => {
      result.current.commandMenu.toggleCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(true);

    act(() => {
      result.current.commandMenu.toggleCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(false);
  });

  it('should toggle command menu persistent state', () => {
    const { result } = renderHooks();

    expect(result.current.isCommandMenuPersistent).toBe(false);

    act(() => {
      result.current.commandMenu.toggleCommandMenuPersistent();
    });

    expect(result.current.isCommandMenuPersistent).toBe(true);

    act(() => {
      result.current.commandMenu.toggleCommandMenuPersistent();
    });

    expect(result.current.isCommandMenuPersistent).toBe(false);
  });

  it('should not close menu when persistent and closeCommandMenu is called', () => {
    const { result } = renderHooks();

    // Open the menu first
    act(() => {
      result.current.commandMenu.openCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(true);

    // Make the menu persistent
    act(() => {
      result.current.commandMenu.toggleCommandMenuPersistent();
    });

    expect(result.current.isCommandMenuPersistent).toBe(true);
    expect(result.current.isCommandMenuOpened).toBe(true);

    // Try to close the menu - it should remain open because it's persistent
    act(() => {
      result.current.commandMenu.closeCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(true);
    expect(result.current.isCommandMenuPersistent).toBe(true);
  });
});
