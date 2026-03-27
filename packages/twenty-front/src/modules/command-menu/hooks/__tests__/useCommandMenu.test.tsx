import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SidePanelPages } from 'twenty-shared/types';
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
      const commandMenu = useSidePanelMenu();

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

describe('useSidePanelMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open and close the command menu', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.openSidePanelMenu();
    });

    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(true);

    act(() => {
      result.current.commandMenu.closeSidePanelMenu();
    });

    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(false);
  });

  it('should toggle the command menu', () => {
    const { result } = renderHooks();

    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(false);

    act(() => {
      result.current.commandMenu.toggleSidePanelMenu();
    });

    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(true);

    act(() => {
      result.current.commandMenu.toggleSidePanelMenu();
    });

    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(false);
  });

  it('should navigate command menu and reset navigation stack when resetNavigationStack is true', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.navigateSidePanelMenu({
        page: SidePanelPages.CommandMenuDisplay,
        pageTitle: 'First Page',
        pageIcon: IconDotsVertical,
        resetNavigationStack: false,
      });
    });

    expect(jotaiStore.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.CommandMenuDisplay,
    );
    expect(jotaiStore.get(sidePanelPageInfoState.atom).title).toBe(
      'First Page',
    );
    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toHaveLength(1);

    act(() => {
      result.current.commandMenu.navigateSidePanelMenu({
        page: SidePanelPages.SearchRecords,
        pageTitle: 'Second Page',
        pageIcon: IconDotsVertical,
        resetNavigationStack: false,
      });
    });

    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toHaveLength(2);

    act(() => {
      result.current.commandMenu.navigateSidePanelMenu({
        page: SidePanelPages.CommandMenuDisplay,
        pageTitle: 'Reset Page',
        pageIcon: IconDotsVertical,
        resetNavigationStack: true,
      });
    });

    expect(jotaiStore.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.CommandMenuDisplay,
    );
    expect(jotaiStore.get(sidePanelPageInfoState.atom).title).toBe(
      'Reset Page',
    );
    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toHaveLength(1);
  });
});
