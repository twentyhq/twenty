import { useNavigateToMoreWidgets } from '@/page-layout/hooks/useNavigateToMoreWidgets';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { widgetCreationTargetTabIdComponentState } from '@/page-layout/states/widgetCreationTargetTabIdComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const mockNavigatePageLayoutSidePanel = jest.fn();
let mockTabId = 'main-tab';

jest.mock('@/page-layout/contexts/PageLayoutContentContext', () => ({
  usePageLayoutContentContext: () => ({ tabId: mockTabId }),
}));

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

describe('useNavigateToMoreWidgets', () => {
  const instanceId = PAGE_LAYOUT_TEST_INSTANCE_ID;
  const editingWidgetAtom = pageLayoutEditingWidgetIdComponentState.atomFamily({
    instanceId,
    surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
  });
  const targetTabAtom = widgetCreationTargetTabIdComponentState.atomFamily({
    instanceId,
    surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
  });
  const insertionContextAtom = widgetInsertionContextComponentState.atomFamily({
    instanceId,
    surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
  });

  const setup = () => {
    const store = createStore();
    store.set(editingWidgetAtom, 'previous-widget');
    store.set(targetTabAtom, 'previous-tab');
    store.set(insertionContextAtom, {
      targetWidgetId: 'previous-widget',
      direction: 'below',
    });

    const { result } = renderHook(() => useNavigateToMoreWidgets(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
      ),
    });
    return { store, result };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTabId = 'main-tab';
  });

  it.each(['main-tab', 'pinned-tab'])(
    'opens the picker at the requested insertion point in %s without replacing a widget',
    (tabId) => {
      mockTabId = tabId;
      const { store, result } = setup();

      act(() =>
        result.current.navigateToMoreWidgets({
          targetWidgetId: 'next-widget',
          direction: 'above',
        }),
      );

      expect(store.get(editingWidgetAtom)).toBeNull();
      expect(store.get(targetTabAtom)).toBe(tabId);
      expect(store.get(insertionContextAtom)).toEqual({
        targetWidgetId: 'next-widget',
        direction: 'above',
      });
      expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
        sidePanelPage: SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
      });
    },
  );

  it('clears a previous insertion point when opening the bottom picker', () => {
    const { store, result } = setup();
    act(() => result.current.navigateToMoreWidgets());

    expect(store.get(insertionContextAtom)).toBeNull();
    expect(store.get(editingWidgetAtom)).toBeNull();
    expect(store.get(targetTabAtom)).toBe('main-tab');
  });

  it('preserves the insertion point when reopening a closing panel', () => {
    const { store, result } = setup();
    const insertionContext = {
      targetWidgetId: 'next-widget',
      direction: 'above',
    } as const;
    mockNavigatePageLayoutSidePanel.mockImplementationOnce(() => {
      store.set(editingWidgetAtom, null);
      store.set(insertionContextAtom, null);
    });

    act(() => result.current.navigateToMoreWidgets(insertionContext));

    expect(store.get(insertionContextAtom)).toEqual(insertionContext);
    expect(store.get(editingWidgetAtom)).toBeNull();
    expect(store.get(targetTabAtom)).toBe('main-tab');
  });
});
