import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  AggregateOperations,
  BarChartLayout,
  GraphOrderBy,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

describe('usePageLayoutDraftState', () => {
  it.each([null, 'tab-2'])(
    'should track default-tab edits when the persisted default is %s',
    (defaultTabToFocusOnMobileAndSidePanelId) => {
      const store = createStore();
      const persistedPageLayout: PageLayout = {
        ...makeDraft([makeTab('tab-1', []), makeTab('tab-2', [], 1)]),
        id: PAGE_LAYOUT_TEST_INSTANCE_ID,
        applicationId: 'application-id',
        universalIdentifier: 'page-layout-universal-identifier',
        isSystemSideEffect: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        deletedAt: null,
        defaultTabToFocusOnMobileAndSidePanelId,
      };

      store.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        persistedPageLayout,
      );
      store.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        toDraftPageLayout(persistedPageLayout),
      );

      const { result } = renderHook(() => usePageLayoutDraftState(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            {children}
          </PageLayoutTestWrapper>
        ),
      });

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.setPageLayoutDraft((draft) => ({
          ...draft,
          defaultTabToFocusOnMobileAndSidePanelId: 'tab-1',
        }));
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.setPageLayoutDraft((draft) => ({
          ...draft,
          defaultTabToFocusOnMobileAndSidePanelId,
        }));
      });

      expect(result.current.isDirty).toBe(false);
    },
  );

  it('should detect dirty state when draft differs from persisted', () => {
    const { result } = renderHook(
      () => usePageLayoutDraftState(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    expect(result.current.isDirty).toBe(false);
    expect(result.current.canSave).toBe(false);
  });

  it('should handle empty name as not saveable', () => {
    const { result } = renderHook(
      () => usePageLayoutDraftState(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.setPageLayoutDraft({
        id: 'test-layout',
        name: '   ',
        type: PageLayoutType.DASHBOARD,
        isFirstTabPinned: true,
        objectMetadataId: null,
        tabs: [],
      });
    });

    expect(result.current.isDirty).toBe(false);
    expect(result.current.canSave).toBe(false);
  });

  it('should allow updating draft state', () => {
    const { result } = renderHook(
      () => usePageLayoutDraftState(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.setPageLayoutDraft({
        id: 'test-layout',
        name: 'Updated Name',
        type: PageLayoutType.DASHBOARD,
        isFirstTabPinned: true,
        objectMetadataId: null,
        tabs: [],
      });
    });

    expect(result.current.pageLayoutDraft.name).toBe('Updated Name');
    expect(result.current.canSave).toBe(true);
    expect(result.current.isDirty).toBe(true);
  });

  it('should detect changes in widgets', () => {
    const { result } = renderHook(
      () => usePageLayoutDraftState(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.setPageLayoutDraft({
        id: 'test-layout',
        name: 'Test Layout',
        type: PageLayoutType.DASHBOARD,
        isFirstTabPinned: true,
        objectMetadataId: null,
        tabs: [
          {
            isSystemSideEffect: false,
            universalIdentifier: 'universal-identifier-mock',
            id: 'tab-1',
            applicationId: '',
            title: 'Tab 1',
            isActive: true,
            position: 0,
            pageLayoutId: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            widgets: [
              {
                isSystemSideEffect: false,
                universalIdentifier: 'universal-identifier-mock',
                id: 'widget-1',
                applicationId: '',
                pageLayoutTabId: 'tab-1',
                title: 'New Widget',
                isActive: true,
                type: WidgetType.GRAPH,
                position: {
                  __typename: 'PageLayoutWidgetGridPosition' as const,
                  layoutMode: PageLayoutTabLayoutMode.GRID,
                  row: 2,
                  column: 2,
                  rowSpan: 2,
                  columnSpan: 2,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.BAR_CHART,
                  layout: BarChartLayout.VERTICAL,
                  aggregateOperation: AggregateOperations.COUNT,
                  aggregateFieldMetadataId: 'id',
                  primaryAxisGroupByFieldMetadataId: 'createdAt',
                  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
                  displayDataLabel: false,
                },
                objectMetadataId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null,
              },
            ],
          },
        ],
      });
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.canSave).toBe(true);
  });
});
