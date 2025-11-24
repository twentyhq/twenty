import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { IconDotsVertical } from 'twenty-ui/display';

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

    expect(result.current.commandMenuPage).toBe(CommandMenuPages.Root);
    expect(result.current.commandMenuPageInfo.title).toBe('First Page');
    expect(result.current.commandMenuNavigationStack).toHaveLength(1);

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Second Page',
        pageIcon: IconDotsVertical,
        resetNavigationStack: false,
      });
    });

    expect(result.current.commandMenuNavigationStack).toHaveLength(2);

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.Root,
        pageTitle: 'Reset Page',
        pageIcon: IconDotsVertical,
        resetNavigationStack: true,
      });
    });

    expect(result.current.commandMenuPage).toBe(CommandMenuPages.Root);
    expect(result.current.commandMenuPageInfo.title).toBe('Reset Page');
    expect(result.current.commandMenuNavigationStack).toHaveLength(1);
  });
});
