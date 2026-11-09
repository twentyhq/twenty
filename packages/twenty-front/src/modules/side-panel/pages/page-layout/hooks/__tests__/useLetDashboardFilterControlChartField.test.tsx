import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { useResetDraftPageLayoutToPersistedPageLayout } from '@/page-layout/hooks/useResetDraftPageLayoutToPersistedPageLayout';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { useLetDashboardFilterControlChartField } from '@/side-panel/pages/page-layout/hooks/useLetDashboardFilterControlChartField';
import { hasInitializedChartFiltersComponentState } from '@/side-panel/pages/page-layout/states/hasInitializedChartFiltersComponentState';
import { getChartFiltersSettingsInstanceId } from '@/side-panel/pages/page-layout/utils/getChartFiltersSettingsInstanceId';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';
import { TEST_AGGREGATE_CHART_CONFIGURATION } from '~/testing/mock-data/widget-configurations';

const OBJECT_METADATA_ID = 'opportunity-object-id';
const CLOSE_DATE_FIELD_ID = 'close-date-field-id';
const CLOSE_DATE_CONDITION = {
  id: 'close-date-condition',
  fieldMetadataId: CLOSE_DATE_FIELD_ID,
  operand: 'IS_RELATIVE',
  value: 'PAST_30_DAY',
};

const CHART_WIDGET = {
  ...makeWidget('chart-widget', 0),
  type: WidgetType.GRAPH,
  objectMetadataId: OBJECT_METADATA_ID,
  configuration: {
    ...TEST_AGGREGATE_CHART_CONFIGURATION,
    filter: { recordFilters: [CLOSE_DATE_CONDITION], recordFilterGroups: [] },
  },
};

const PAGE_LAYOUT = {
  ...makeDraft([makeTab('tab-1', [CHART_WIDGET])]),
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  type: PageLayoutType.DASHBOARD,
  applicationId: '',
  universalIdentifier: PAGE_LAYOUT_TEST_INSTANCE_ID,
  isSystemSideEffect: false,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const CHART_FILTERS_INITIALIZED_ATOM =
  hasInitializedChartFiltersComponentState.atomFamily(
    getChartFiltersSettingsInstanceId({
      widgetId: CHART_WIDGET.id,
      objectMetadataItemId: OBJECT_METADATA_ID,
    }),
  );
const DRAFT_ATOM = pageLayoutDraftComponentState.atomFamily({
  instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
});

const getDraftChartFilter = (store: ReturnType<typeof createStore>) => {
  const configuration = store.get(DRAFT_ATOM).tabs[0].widgets[0].configuration;

  return 'filter' in configuration ? configuration.filter : undefined;
};

describe('useLetDashboardFilterControlChartField', () => {
  it('should make the chart Filters page reload after the hand-over and after Cancel', () => {
    const store = createStore();

    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      PAGE_LAYOUT,
    );
    store.set(DRAFT_ATOM, PAGE_LAYOUT);
    store.set(
      pageLayoutEditingWidgetIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      CHART_WIDGET.id,
    );

    const wrapper = ({ children }: { children: ReactNode }) => (
      <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
    );

    const { result } = renderHook(
      () => ({
        ...useLetDashboardFilterControlChartField({
          pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          widget: CHART_WIDGET,
        }),
        ...useResetDraftPageLayoutToPersistedPageLayout({
          pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          tabListInstanceId: getTabListInstanceIdFromPageLayoutId(
            PAGE_LAYOUT_TEST_INSTANCE_ID,
          ),
        }),
      }),
      { wrapper },
    );

    store.set(CHART_FILTERS_INITIALIZED_ATOM, true);

    act(() =>
      result.current.letDashboardFilterControlChartField({
        pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
        fieldMetadataId: CLOSE_DATE_FIELD_ID,
        filterWithoutFieldConditions: {
          recordFilters: [],
          recordFilterGroups: [],
        },
      }),
    );

    expect(getDraftChartFilter(store)).toEqual({
      recordFilters: [],
      recordFilterGroups: [],
    });
    expect(store.get(CHART_FILTERS_INITIALIZED_ATOM)).toBe(false);

    // The Filters page is opened on the handed-over draft, then the edit is cancelled
    store.set(CHART_FILTERS_INITIALIZED_ATOM, true);

    act(() => result.current.resetDraftPageLayoutToPersistedPageLayout());

    expect(getDraftChartFilter(store)).toEqual({
      recordFilters: [CLOSE_DATE_CONDITION],
      recordFilterGroups: [],
    });
    expect(store.get(CHART_FILTERS_INITIALIZED_ATOM)).toBe(false);
  });
});
