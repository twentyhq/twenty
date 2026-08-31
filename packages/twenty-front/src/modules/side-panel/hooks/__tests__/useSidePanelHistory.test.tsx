import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SIDE_PANEL_ARTIFACT_PAGE } from '@/side-panel/constants/SidePanelArtifactPage';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSidePanelCloseAnimationCompleteCleanup } from '@/side-panel/hooks/useSidePanelCloseAnimationCompleteCleanup';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SidePanelPages } from 'twenty-shared/types';
import { IconList, IconSearch } from 'twenty-ui/icon';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MemoryRouter>{children}</MemoryRouter>
  </JotaiProvider>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const commandMenu = useSidePanelMenu();
      const commandMenuHistory = useSidePanelHistory();
      const sidePanelCloseAnimationCompleteCleanup =
        useSidePanelCloseAnimationCompleteCleanup();

      return {
        commandMenu,
        commandMenuHistory,
        sidePanelCloseAnimationCompleteCleanup,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
  return { result };
};

describe('useSidePanelHistory', () => {
  it('should go back from a page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.navigateSidePanelMenu({
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: '/objects/companies',
        pageTitle: 'Companies',
        pageIcon: IconList,
        pageId: '1',
      });
    });

    act(() => {
      result.current.commandMenu.navigateSidePanelMenu({
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: '/object/company/record-id',
        pageTitle: 'Company',
        pageIcon: IconList,
        pageId: '2',
      });
    });

    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([
      {
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: '/objects/companies',
        pageTitle: 'Companies',
        pageIcon: IconList,
        pageId: '1',
      },
      {
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: '/object/company/record-id',
        pageTitle: 'Company',
        pageIcon: IconList,
        pageId: '2',
      },
    ]);

    act(() => {
      result.current.commandMenuHistory.goBackFromSidePanel();
    });

    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([
      {
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: '/objects/companies',
        pageTitle: 'Companies',
        pageIcon: IconList,
        pageId: '1',
      },
    ]);
    expect(jotaiStore.get(sidePanelPageState.atom)).toBe(
      SIDE_PANEL_ARTIFACT_PAGE,
    );
    expect(jotaiStore.get(sidePanelPageInfoState.atom)).toEqual({
      title: 'Companies',
      Icon: IconList,
      instanceId: '1',
    });

    act(() => {
      result.current.commandMenuHistory.goBackFromSidePanel();
    });

    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([]);

    act(() => {
      result.current.sidePanelCloseAnimationCompleteCleanup.sidePanelCloseAnimationCompleteCleanup();
    });
    expect(jotaiStore.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.CommandMenuDisplay,
    );
    expect(jotaiStore.get(sidePanelPageInfoState.atom)).toEqual({
      title: undefined,
      instanceId: '',
      Icon: undefined,
    });
    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(false);
  });

  it('should clear navigation stack immediately when closeSidePanelMenu is called', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.navigateSidePanelMenu({
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: '/object/company/record-id',
        pageTitle: 'Company',
        pageIcon: IconList,
        pageId: '1',
      });
    });

    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([
      {
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath: '/object/company/record-id',
        pageTitle: 'Company',
        pageIcon: IconList,
        pageId: '1',
      },
    ]);

    act(() => {
      result.current.commandMenu.closeSidePanelMenu();
    });

    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([]);
  });

  it('should navigate to a page in history', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.navigateSidePanelMenu({
        page: SidePanelPages.SearchRecords,
        pageTitle: 'Search',
        pageIcon: IconSearch,
        pageId: '1',
      });
    });

    act(() => {
      result.current.commandMenuHistory.navigateSidePanelHistory(0);
    });

    expect(jotaiStore.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.SearchRecords,
    );
    expect(jotaiStore.get(sidePanelPageInfoState.atom)).toEqual({
      title: 'Search',
      Icon: IconSearch,
      instanceId: '1',
    });
  });
});
