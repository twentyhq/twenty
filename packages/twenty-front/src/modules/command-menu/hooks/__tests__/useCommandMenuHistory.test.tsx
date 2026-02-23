import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useCommandMenuCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useCommandMenuCloseAnimationCompleteCleanup';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CommandMenuPages } from 'twenty-shared/types';
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

      return {
        commandMenu,
        commandMenuHistory,
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

    expect(jotaiStore.get(commandMenuNavigationStackState.atom)).toEqual([
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

    expect(jotaiStore.get(commandMenuNavigationStackState.atom)).toEqual([
      {
        page: CommandMenuPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
        pageId: '1',
      },
    ]);
    expect(jotaiStore.get(commandMenuPageState.atom)).toBe(
      CommandMenuPages.SearchRecords,
    );
    expect(jotaiStore.get(commandMenuPageInfoState.atom)).toEqual({
      title: 'Search',
      Icon: IconSearch,
      instanceId: '1',
    });

    act(() => {
      result.current.commandMenuHistory.goBackFromCommandMenu();
      result.current.commandMenuCloseAnimationCompleteCleanup.commandMenuCloseAnimationCompleteCleanup();
    });

    expect(jotaiStore.get(commandMenuNavigationStackState.atom)).toEqual([]);
    expect(jotaiStore.get(commandMenuPageState.atom)).toBe(
      CommandMenuPages.Root,
    );
    expect(jotaiStore.get(commandMenuPageInfoState.atom)).toEqual({
      title: undefined,
      instanceId: '',
      Icon: undefined,
    });
    expect(jotaiStore.get(isCommandMenuOpenedStateV2.atom)).toBe(false);
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

    expect(jotaiStore.get(commandMenuPageState.atom)).toBe(
      CommandMenuPages.SearchRecords,
    );
    expect(jotaiStore.get(commandMenuPageInfoState.atom)).toEqual({
      title: 'Search',
      Icon: IconSearch,
      instanceId: '1',
    });
  });
});
