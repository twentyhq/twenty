import { useDuplicatePageLayoutWidget } from '@/page-layout/hooks/useDuplicatePageLayoutWidget';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(() => 'duplicated-widget-id'),
}));

const DASHBOARD_FILTER_BINDINGS: Record<string, DashboardFilterBinding | null> =
  {
    'date-slot': { fieldMetadataId: 'created-at-field-id' },
    'owner-slot': null,
  };

const sourceWidget = buildDraftPageLayoutWidget({
  id: 'source-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Companies',
  type: WidgetType.GRAPH,
  configuration: {
    ...buildDefaultBarChartConfiguration({}),
    dashboardFilterBindings: DASHBOARD_FILTER_BINDINGS,
  },
  position: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 2,
    columnSpan: 2,
  },
  objectMetadataId: 'company-object-id',
});

describe('useDuplicatePageLayoutWidget', () => {
  it('copies the dashboard filter bindings onto the duplicated chart', () => {
    const store = createStore();

    const draftAtom = pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

    store.set(draftAtom, {
      ...makeDraft([
        makeTab('tab-1', [sourceWidget], 0, PageLayoutTabLayoutMode.GRID),
      ]),
      type: PageLayoutType.DASHBOARD,
    });

    store.set(
      pageLayoutCurrentLayoutsComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        'tab-1': {
          desktop: [{ i: 'source-widget', x: 0, y: 0, w: 2, h: 2 }],
          mobile: [{ i: 'source-widget', x: 0, y: 0, w: 1, h: 2 }],
        },
      },
    );

    const { result } = renderHook(
      () => useDuplicatePageLayoutWidget(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );

    act(() => {
      result.current.duplicateWidget('source-widget');
    });

    const duplicatedWidget = store
      .get(draftAtom)
      .tabs[0].widgets.find((widget) => widget.id === 'duplicated-widget-id');

    expect(duplicatedWidget?.configuration).toMatchObject({
      dashboardFilterBindings: DASHBOARD_FILTER_BINDINGS,
    });
  });
});
