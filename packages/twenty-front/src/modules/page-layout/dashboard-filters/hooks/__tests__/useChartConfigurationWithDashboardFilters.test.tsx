import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { BUILT_IN_DASHBOARD_FILTER_SLOT_IDS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlotIds';
import { useChartConfigurationWithDashboardFilters } from '@/page-layout/dashboard-filters/hooks/useChartConfigurationWithDashboardFilters';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  GRAPH_WIDGET_TEST_INSTANCE_ID,
  GraphWidgetTestWrapper,
  PAGE_LAYOUT_TEST_INSTANCE_ID,
} from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { renderHook } from '@testing-library/react';
import { type Store } from 'jotai/vanilla/store';
import { type ReactNode } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  AggregateOperations,
  type BarChartConfiguration,
  FeatureFlagKey,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const createdAtFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'createdAt',
});

const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const CHART_OWN_RECORD_FILTER = {
  id: 'chart-own-filter',
  fieldMetadataId: nameFieldMetadataItem.id,
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
};

const configuration = {
  __typename: 'BarChartConfiguration',
  configurationType: 'BAR_CHART',
  aggregateFieldMetadataId: nameFieldMetadataItem.id,
  aggregateOperation: AggregateOperations.COUNT,
  primaryAxisGroupByFieldMetadataId: createdAtFieldMetadataItem.id,
  filter: { recordFilters: [CHART_OWN_RECORD_FILTER] },
} as unknown as BarChartConfiguration;

const graphWidget = {
  id: GRAPH_WIDGET_TEST_INSTANCE_ID,
  pageLayoutTabId: 'tab-1',
  title: 'Companies',
  type: WidgetType.GRAPH,
  objectMetadataId: companyObjectMetadataItem.id,
  configuration,
} as unknown as PageLayoutWidget;

const renderUseChartConfigurationWithDashboardFilters = ({
  isDashboardFiltersEnabled,
  pageLayoutType,
}: {
  isDashboardFiltersEnabled: boolean;
  pageLayoutType: PageLayoutType;
}) => {
  const onInitializeJotaiStore = (store: Store) => {
    store.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        {
          key: FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
          value: isDashboardFiltersEnabled,
        },
      ],
    });

    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        id: PAGE_LAYOUT_TEST_INSTANCE_ID,
        name: 'Dashboard',
        type: pageLayoutType,
        objectMetadataId: null,
        tabs: [makeTab('tab-1', [graphWidget])],
      } as unknown as PageLayout,
    );

    store.set(
      dashboardFilterValuesComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.DATE]: {
          operand: ViewFilterOperand.IS_TODAY,
          value: '',
        },
      },
    );
  };

  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore,
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MetadataWrapper>
      <GraphWidgetTestWrapper>{children}</GraphWidgetTestWrapper>
    </MetadataWrapper>
  );

  return renderHook(
    () => useChartConfigurationWithDashboardFilters(configuration),
    { wrapper },
  );
};

describe('useChartConfigurationWithDashboardFilters', () => {
  it('returns the same configuration when the feature flag is off', () => {
    const { result } = renderUseChartConfigurationWithDashboardFilters({
      isDashboardFiltersEnabled: false,
      pageLayoutType: PageLayoutType.DASHBOARD,
    });

    expect(result.current).toBe(configuration);
  });

  it('appends the dashboard filter after the chart own filters without touching the input', () => {
    const { result } = renderUseChartConfigurationWithDashboardFilters({
      isDashboardFiltersEnabled: true,
      pageLayoutType: PageLayoutType.DASHBOARD,
    });

    expect(result.current).not.toBe(configuration);
    expect(result.current.filter.recordFilters).toEqual([
      CHART_OWN_RECORD_FILTER,
      expect.objectContaining({
        id: 'dashboard-filter-slot-built-in-date',
        fieldMetadataId: createdAtFieldMetadataItem.id,
        type: 'DATE_TIME',
        operand: ViewFilterOperand.IS_TODAY,
        value: '',
      }),
    ]);
    expect(configuration.filter.recordFilters).toEqual([
      CHART_OWN_RECORD_FILTER,
    ]);
  });

  it('returns the same configuration when the layout is not a dashboard', () => {
    const { result } = renderUseChartConfigurationWithDashboardFilters({
      isDashboardFiltersEnabled: true,
      pageLayoutType: PageLayoutType.RECORD_PAGE,
    });

    expect(result.current).toBe(configuration);
  });
});
