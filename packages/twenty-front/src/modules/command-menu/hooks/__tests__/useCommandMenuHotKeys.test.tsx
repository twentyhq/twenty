import { fireEvent, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { act, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { PageFocusId } from '@/types/PageFocusId';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { SidePanelPages } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/icon';

const sidePanelFocusItem = {
  focusId: SIDE_PANEL_FOCUS_ID,
  componentInstance: {
    componentType: FocusComponentType.SIDE_PANEL,
    componentInstanceId: SIDE_PANEL_FOCUS_ID,
  },
  globalHotkeysConfig: {
    enableGlobalHotkeysWithModifiers: true,
    enableGlobalHotkeysConflictingWithKeyboard: false,
  },
};

const recordIndexFocusItem = {
  focusId: PageFocusId.RecordIndex,
  componentInstance: {
    componentType: FocusComponentType.PAGE,
    componentInstanceId: PageFocusId.RecordIndex,
  },
  globalHotkeysConfig: {
    enableGlobalHotkeysWithModifiers: true,
    enableGlobalHotkeysConflictingWithKeyboard: true,
  },
};

const createCommandMenuHotkeysStore = () => {
  const store = createStore();

  store.set(sidePanelPageState.atom, SidePanelPages.SearchRecords);
  store.set(sidePanelPageInfoState.atom, {
    title: 'Search',
    Icon: IconDotsVertical,
    instanceId: 'search-records',
  });
  store.set(sidePanelNavigationStackState.atom, [
    {
      page: SidePanelPages.CommandMenuDisplay,
      pageTitle: 'Command Menu',
      pageIcon: IconDotsVertical,
      pageId: 'command-menu',
    },
    {
      page: SidePanelPages.SearchRecords,
      pageTitle: 'Search',
      pageIcon: IconDotsVertical,
      pageId: 'search-records',
    },
  ]);
  store.set(focusStackState.atom, [sidePanelFocusItem]);

  return store;
};

const renderUseCommandMenuHotKeys = (store = createCommandMenuHotkeysStore()) =>
  renderHook(() => useCommandMenuHotKeys(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </JotaiProvider>
    ),
  });

describe('useCommandMenuHotKeys', () => {
  it('goes back from the side panel on Escape when side panel owns focus', () => {
    const store = createCommandMenuHotkeysStore();

    renderUseCommandMenuHotKeys(store);

    act(() => {
      fireEvent.keyDown(document, {
        key: 'Escape',
        code: 'Escape',
      });
    });

    expect(store.get(sidePanelNavigationStackState.atom)).toHaveLength(1);
    expect(store.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.CommandMenuDisplay,
    );
  });

  it('clears side panel search on Escape before navigating', () => {
    const store = createCommandMenuHotkeysStore();

    store.set(sidePanelSearchState.atom, 'company');

    renderUseCommandMenuHotKeys(store);

    act(() => {
      fireEvent.keyDown(document, {
        key: 'Escape',
        code: 'Escape',
      });
    });

    expect(store.get(sidePanelSearchState.atom)).toBe('');
    expect(store.get(sidePanelNavigationStackState.atom)).toHaveLength(2);
  });

  it('does not navigate side panel history with Delete', () => {
    const store = createCommandMenuHotkeysStore();

    renderUseCommandMenuHotKeys(store);

    act(() => {
      fireEvent.keyDown(document, {
        key: 'Delete',
        code: 'Delete',
      });
    });

    expect(store.get(sidePanelNavigationStackState.atom)).toHaveLength(2);
    expect(store.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.SearchRecords,
    );
  });

  it('does not trigger side panel Escape when left content owns focus', () => {
    const store = createCommandMenuHotkeysStore();

    store.set(focusStackState.atom, [recordIndexFocusItem]);

    renderUseCommandMenuHotKeys(store);

    act(() => {
      fireEvent.keyDown(document, {
        key: 'Escape',
        code: 'Escape',
      });
    });

    expect(store.get(sidePanelNavigationStackState.atom)).toHaveLength(2);
    expect(store.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.SearchRecords,
    );
  });
});
