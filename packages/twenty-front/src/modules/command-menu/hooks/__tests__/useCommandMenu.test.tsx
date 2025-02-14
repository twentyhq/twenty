import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageTitle';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { IconList, IconSearch } from 'twenty-ui';

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
  it('should open and close the command menu', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.openRootCommandMenu();
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

  it('should navigate to a page', () => {
    const { result } = renderHooks();

    expect(result.current.commandMenuNavigationStack).toEqual([]);
    expect(result.current.commandMenuPage).toBe(CommandMenuPages.Root);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: undefined,
      Icon: undefined,
    });

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
      });
    });

    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
      },
    ]);
    expect(result.current.commandMenuPage).toBe(CommandMenuPages.SearchRecords);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: 'Search',
      Icon: IconSearch,
    });

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.ViewRecord,
        pageTitle: 'Company',
        pageIcon: IconList,
      });
    });

    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
      },
      {
        page: CommandMenuPages.ViewRecord,
        pageTitle: 'Company',
        pageIcon: IconList,
      },
    ]);
    expect(result.current.commandMenuPage).toBe(CommandMenuPages.ViewRecord);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: 'Company',
      Icon: IconList,
    });
  });

  it('should go back from a page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
      });
    });

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.ViewRecord,
        pageTitle: 'Company',
        pageIcon: IconList,
      });
    });

    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
      },
      {
        page: CommandMenuPages.ViewRecord,
        pageTitle: 'Company',
        pageIcon: IconList,
      },
    ]);

    act(() => {
      result.current.commandMenu.goBackFromCommandMenu();
    });

    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
      },
    ]);
    expect(result.current.commandMenuPage).toBe(CommandMenuPages.SearchRecords);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: 'Search',
      Icon: IconSearch,
    });

    act(() => {
      result.current.commandMenu.goBackFromCommandMenu();
    });

    expect(result.current.commandMenuNavigationStack).toEqual([]);
    expect(result.current.commandMenuPage).toBe(CommandMenuPages.Root);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: undefined,
      Icon: undefined,
    });
    expect(result.current.isCommandMenuOpened).toBe(false);
  });

  it('should navigate to a page in history', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
      });
    });

    act(() => {
      result.current.commandMenu.navigateCommandMenuHistory(0);
    });

    expect(result.current.commandMenuPage).toBe(CommandMenuPages.SearchRecords);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: 'Search',
      Icon: IconSearch,
    });
  });
});
