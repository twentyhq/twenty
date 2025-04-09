import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useCommandMenuCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useCommandMenuCloseAnimationCompleteCleanup';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { IconList, IconSearch } from 'twenty-ui/display';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <MemoryRouter>{children}</MemoryRouter>
  </RecoilRoot>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const commandMenu = useCommandMenu();
      const commandMenuHistory = useCommandMenuHistory();
      const commandMenuCloseAnimationCompleteCleanup =
        useCommandMenuCloseAnimationCompleteCleanup();
      const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
      const commandMenuNavigationStack = useRecoilValue(
        commandMenuNavigationStackState,
      );
      const commandMenuPage = useRecoilValue(commandMenuPageState);
      const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);

      return {
        commandMenu,
        commandMenuHistory,
        isCommandMenuOpened,
        commandMenuNavigationStack,
        commandMenuPage,
        commandMenuPageInfo,
        commandMenuCloseAnimationCompleteCleanup,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
  return { result };
};

describe('useCommandMenuHistory', () => {
  it('should go back from a page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
        pageId: '1',
      });
    });

    act(() => {
      result.current.commandMenu.navigateCommandMenu({
        page: CommandMenuPages.ViewRecord,
        pageTitle: 'Company',
        pageIcon: IconList,
        pageId: '2',
      });
    });

    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
        pageId: '1',
      },
      {
        page: CommandMenuPages.ViewRecord,
        pageTitle: 'Company',
        pageIcon: IconList,
        pageId: '2',
      },
    ]);

    act(() => {
      result.current.commandMenuHistory.goBackFromCommandMenu();
    });

    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
        pageId: '1',
      },
    ]);
    expect(result.current.commandMenuPage).toBe(CommandMenuPages.SearchRecords);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: 'Search',
      Icon: IconSearch,
      instanceId: '1',
    });

    act(() => {
      result.current.commandMenuHistory.goBackFromCommandMenu();
      result.current.commandMenuCloseAnimationCompleteCleanup.commandMenuCloseAnimationCompleteCleanup();
    });

    expect(result.current.commandMenuNavigationStack).toEqual([]);
    expect(result.current.commandMenuPage).toBe(CommandMenuPages.Root);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: undefined,
      instanceId: '',
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
        pageId: '1',
      });
    });

    act(() => {
      result.current.commandMenuHistory.navigateCommandMenuHistory(0);
    });

    expect(result.current.commandMenuPage).toBe(CommandMenuPages.SearchRecords);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: 'Search',
      Icon: IconSearch,
      instanceId: '1',
    });
  });
});
