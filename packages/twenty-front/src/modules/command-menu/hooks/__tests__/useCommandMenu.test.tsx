import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CommandMenuPages } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/display';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MemoryRouter
      initialEntries={['/one', '/two', { pathname: '/three' }]}
      initialIndex={1}
    >
      {children}
    </MemoryRouter>
  </JotaiProvider>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const commandMenu = useCommandMenu();

      return {
        commandMenu,
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

    expect(jotaiStore.get(isCommandMenuOpenedState.atom)).toBe(true);

    act(() => {
      result.current.commandMenu.closeCommandMenu();
    });

    expect(jotaiStore.get(isCommandMenuOpenedState.atom)).toBe(false);
  });

  it('should toggle the command menu', () => {
    const { result } = renderHooks();

    expect(jotaiStore.get(isCommandMenuOpenedState.atom)).toBe(false);

    act(() => {
      result.current.commandMenu.toggleCommandMenu();
    });

    expect(jotaiStore.get(isCommandMenuOpenedState.atom)).toBe(true);

    act(() => {
      result.current.commandMenu.toggleCommandMenu();
    });

    expect(jotaiStore.get(isCommandMenuOpenedState.atom)).toBe(false);
  });

  it('should navigate command menu and reset navigation stack when resetNavigationStack is true', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.Root,
        pageTitle: 'First Page',
        pageIcon: IconDotsVertical,
        resetNavigationStack: false,
      });
    });

    expect(jotaiStore.get(commandMenuPageState.atom)).toBe(
      CommandMenuPages.Root,
    );
    expect(jotaiStore.get(commandMenuPageInfoState.atom).title).toBe(
      'First Page',
    );
    expect(jotaiStore.get(commandMenuNavigationStackState.atom)).toHaveLength(
      1,
    );

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Second Page',
        pageIcon: IconDotsVertical,
        resetNavigationStack: false,
      });
    });

    expect(jotaiStore.get(commandMenuNavigationStackState.atom)).toHaveLength(
      2,
    );

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.Root,
        pageTitle: 'Reset Page',
        pageIcon: IconDotsVertical,
        resetNavigationStack: true,
      });
    });

    expect(jotaiStore.get(commandMenuPageState.atom)).toBe(
      CommandMenuPages.Root,
    );
    expect(jotaiStore.get(commandMenuPageInfoState.atom).title).toBe(
      'Reset Page',
    );
    expect(jotaiStore.get(commandMenuNavigationStackState.atom)).toHaveLength(
      1,
    );
  });
});
