import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { type HeadlessEngineCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useRecordShowPagePaginationCommandContext } from '@/command-menu-item/engine-command/record/single-record/hooks/useRecordShowPagePaginationCommandContext';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
);

const mockedUseHeadlessCommandContextApi = jest.mocked(
  useHeadlessCommandContextApi,
);

const RECORD_ID = 'b1c2d3e4-0000-4000-8000-000000000000';
const MAIN_CONTEXT_STORE_INSTANCE_ID = 'main-context-store';
const SIDE_PANEL_PAGE_INSTANCE_ID = 'side-panel-page';

const getWrapper = (store: ReturnType<typeof createStore>) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <JotaiProvider store={store}>{children}</JotaiProvider>;
  };

describe('useRecordShowPagePaginationCommandContext', () => {
  beforeEach(() => {
    mockedUseHeadlessCommandContextApi.mockReturnValue({
      contextStoreInstanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      isInSidePanel: true,
      objectMetadataItem: { nameSingular: 'dashboard' },
      selectedRecords: [{ id: RECORD_ID }],
    } as HeadlessEngineCommandContextApi);
  });

  it('uses the active side panel parent view object for record pagination', () => {
    const store = createStore();

    store.set(sidePanelNavigationStackState.atom, [
      {
        page: SidePanelPages.RoutedPage,
        pageId: SIDE_PANEL_PAGE_INSTANCE_ID,
        pageTitle: 'Follow ups',
      },
    ] as never);
    store.set(
      contextStoreRecordShowParentViewComponentState.atomFamily({
        instanceId: SIDE_PANEL_PAGE_INSTANCE_ID,
      }),
      {
        parentViewComponentId: 'follow-ups-view',
        parentViewObjectNameSingular: 'followUp',
        parentViewFilterGroups: [],
        parentViewFilters: [],
        parentViewSorts: [],
      },
    );

    const { result } = renderHook(
      () => useRecordShowPagePaginationCommandContext(),
      { wrapper: getWrapper(store) },
    );

    expect(result.current).toEqual({
      objectNameSingular: 'followUp',
      recordId: RECORD_ID,
    });
  });

  it('falls back to the command object outside a parent view', () => {
    const store = createStore();

    const { result } = renderHook(
      () => useRecordShowPagePaginationCommandContext(),
      { wrapper: getWrapper(store) },
    );

    expect(result.current).toEqual({
      objectNameSingular: 'dashboard',
      recordId: RECORD_ID,
    });
  });
});
