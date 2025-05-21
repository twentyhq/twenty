import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuHotkeyScope } from '@/command-menu/types/CommandMenuHotkeyScope';

const mockGoBackToPreviousHotkeyScope = jest.fn();
const mockSetHotkeyScopeAndMemorizePreviousScope = jest.fn();

jest.mock('@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope', () => ({
  usePreviousHotkeyScope: () => ({
    goBackToPreviousHotkeyScope: mockGoBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope:
      mockSetHotkeyScopeAndMemorizePreviousScope,
  }),
}));

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
      const commandMenuNavigationStack = useRecoilValue(
        commandMenuNavigationStackState,
      );
      const commandMenuPage = useRecoilValue(commandMenuPageState);
      const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);

      return {
        commandMenu,
        isCommandMenuOpened,
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
    expect(mockSetHotkeyScopeAndMemorizePreviousScope).toHaveBeenCalledWith({
      scope: CommandMenuHotkeyScope.CommandMenuFocused,
      memoizeKey: 'command-menu',
      customScopes: {
        commandMenuOpen: true,
      },
    });

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
    expect(mockSetHotkeyScopeAndMemorizePreviousScope).toHaveBeenCalledWith({
      scope: CommandMenuHotkeyScope.CommandMenuFocused,
      memoizeKey: 'command-menu',
      customScopes: {
        commandMenuOpen: true,
      },
    });

    act(() => {
      result.current.commandMenu.toggleCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(false);
  });

  it('should call goBackToPreviousHotkeyScope when closing the command menu', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.openCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(true);
    expect(mockGoBackToPreviousHotkeyScope).not.toHaveBeenCalled();

    act(() => {
      result.current.commandMenu.closeCommandMenu();
    });

    expect(mockGoBackToPreviousHotkeyScope).toHaveBeenCalledTimes(1);
  });
});
