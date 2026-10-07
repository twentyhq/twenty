import { BUILT_IN_DASHBOARD_FILTER_SLOT_IDS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlotIds';
import { useIsWidgetUnaffectedByDashboardFilters } from '@/page-layout/dashboard-filters/hooks/useIsWidgetUnaffectedByDashboardFilters';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  GraphWidgetTestWrapper,
  PAGE_LAYOUT_TEST_INSTANCE_ID,
} from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { type Store } from 'jotai/vanilla/store';
import { type ReactNode } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const COMPANY_CHART_WIDGET_ID = 'company-chart';
const PERSON_CHART_WIDGET_ID = 'person-chart';
const RECORD_TABLE_WIDGET_ID = 'record-table';

const OWNER_SLOT_VALUE = {
  operand: ViewFilterOperand.IS,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: true,
    selectedRecordIds: [],
  }),
};

const DATE_SLOT_VALUE = { operand: ViewFilterOperand.IS_TODAY, value: '' };

const buildWidget = (
  id: string,
  type: WidgetType,
  objectNameSingular: string,
) =>
  ({
    id,
    pageLayoutTabId: 'tab-1',
    title: id,
    type,
    objectMetadataId: getMockObjectMetadataItemOrThrow(objectNameSingular).id,
    configuration: {},
  }) as unknown as PageLayoutWidget;

// Companies have an account owner, people have no relation to workspace members.
const WIDGETS = [
  buildWidget(COMPANY_CHART_WIDGET_ID, WidgetType.GRAPH, 'company'),
  buildWidget(PERSON_CHART_WIDGET_ID, WidgetType.GRAPH, 'person'),
  buildWidget(RECORD_TABLE_WIDGET_ID, WidgetType.RECORD_TABLE, 'person'),
];

const renderUseIsWidgetUnaffectedByDashboardFilters = ({
  widgetId,
  widgets = WIDGETS,
  pageLayoutType = PageLayoutType.DASHBOARD,
  dashboardFilterValues,
}: {
  widgetId: string;
  widgets?: PageLayoutWidget[];
  pageLayoutType?: PageLayoutType;
  dashboardFilterValues: DashboardFilterValues;
}) => {
  const onInitializeJotaiStore = (store: Store) => {
    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        id: PAGE_LAYOUT_TEST_INSTANCE_ID,
        name: 'Dashboard',
        type: pageLayoutType,
        objectMetadataId: null,
        tabs: [makeTab('tab-1', widgets)],
      } as unknown as PageLayout,
    );

    store.set(
      dashboardFilterValuesComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      dashboardFilterValues,
    );
  };

  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore,
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <MetadataWrapper>
        <GraphWidgetTestWrapper instanceId={widgetId}>
          {children}
        </GraphWidgetTestWrapper>
      </MetadataWrapper>
    </I18nProvider>
  );

  return renderHook(() => useIsWidgetUnaffectedByDashboardFilters(widgetId), {
    wrapper,
  });
};

describe('useIsWidgetUnaffectedByDashboardFilters', () => {
  it('flags a chart that binds none of the valued slots', () => {
    const { result } = renderUseIsWidgetUnaffectedByDashboardFilters({
      widgetId: PERSON_CHART_WIDGET_ID,
      dashboardFilterValues: {
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.OWNER]: OWNER_SLOT_VALUE,
      },
    });

    expect(result.current).toBe(true);
  });

  it('does not flag a chart reached by at least one valued slot', () => {
    const { result } = renderUseIsWidgetUnaffectedByDashboardFilters({
      widgetId: PERSON_CHART_WIDGET_ID,
      dashboardFilterValues: {
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.DATE]: DATE_SLOT_VALUE,
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.OWNER]: OWNER_SLOT_VALUE,
      },
    });

    expect(result.current).toBe(false);
  });

  it('does not flag a chart that binds the valued slot', () => {
    const { result } = renderUseIsWidgetUnaffectedByDashboardFilters({
      widgetId: COMPANY_CHART_WIDGET_ID,
      dashboardFilterValues: {
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.OWNER]: OWNER_SLOT_VALUE,
      },
    });

    expect(result.current).toBe(false);
  });

  it('ignores a value left for a slot no chart of the dashboard binds', () => {
    const { result } = renderUseIsWidgetUnaffectedByDashboardFilters({
      widgetId: PERSON_CHART_WIDGET_ID,
      widgets: [
        buildWidget(PERSON_CHART_WIDGET_ID, WidgetType.GRAPH, 'person'),
      ],
      dashboardFilterValues: {
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.OWNER]: OWNER_SLOT_VALUE,
      },
    });

    expect(result.current).toBe(false);
  });

  it('does not flag anything while no slot has a value', () => {
    const { result } = renderUseIsWidgetUnaffectedByDashboardFilters({
      widgetId: PERSON_CHART_WIDGET_ID,
      dashboardFilterValues: {},
    });

    expect(result.current).toBe(false);
  });

  it('never flags a widget that is not a graph', () => {
    const { result } = renderUseIsWidgetUnaffectedByDashboardFilters({
      widgetId: RECORD_TABLE_WIDGET_ID,
      dashboardFilterValues: {
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.OWNER]: OWNER_SLOT_VALUE,
      },
    });

    expect(result.current).toBe(false);
  });

  it('is off on a record page layout', () => {
    const { result } = renderUseIsWidgetUnaffectedByDashboardFilters({
      widgetId: PERSON_CHART_WIDGET_ID,
      pageLayoutType: PageLayoutType.RECORD_PAGE,
      dashboardFilterValues: {
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.OWNER]: OWNER_SLOT_VALUE,
      },
    });

    expect(result.current).toBe(false);
  });
});
