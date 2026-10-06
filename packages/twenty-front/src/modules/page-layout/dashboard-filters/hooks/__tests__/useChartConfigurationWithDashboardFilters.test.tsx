import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { BUILT_IN_DASHBOARD_FILTER_SLOT_IDS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlotIds';
import { useChartConfigurationWithDashboardFilters } from '@/page-layout/dashboard-filters/hooks/useChartConfigurationWithDashboardFilters';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
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
import { type RecordFilter } from 'twenty-shared/utils';
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

// People have no relation to workspace members in the mocks, so the Owner slot has nothing to bind.
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const accountOwnerFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'accountOwner',
});

const CHART_OWN_RECORD_FILTER = {
  id: 'chart-own-filter',
  fieldMetadataId: nameFieldMetadataItem.id,
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
};

const DATE_SLOT_VALUE = { operand: ViewFilterOperand.IS_TODAY, value: '' };

const CURRENT_WORKSPACE_MEMBER_RELATION_VALUE = JSON.stringify({
  isCurrentWorkspaceMemberSelected: true,
  selectedRecordIds: [],
});

const OWNER_SLOT_VALUE = {
  operand: ViewFilterOperand.IS,
  value: CURRENT_WORKSPACE_MEMBER_RELATION_VALUE,
};

const buildConfiguration = (objectMetadataItem: EnrichedObjectMetadataItem) =>
  ({
    __typename: 'BarChartConfiguration',
    configurationType: 'BAR_CHART',
    aggregateFieldMetadataId: getMockFieldMetadataItemOrThrow({
      objectMetadataItem,
      fieldName: 'name',
    }).id,
    aggregateOperation: AggregateOperations.COUNT,
    primaryAxisGroupByFieldMetadataId: getMockFieldMetadataItemOrThrow({
      objectMetadataItem,
      fieldName: 'createdAt',
    }).id,
    filter: { recordFilters: [CHART_OWN_RECORD_FILTER] },
  }) as unknown as BarChartConfiguration;

const renderUseChartConfigurationWithDashboardFilters = ({
  isDashboardFiltersEnabled = true,
  pageLayoutType = PageLayoutType.DASHBOARD,
  widgetObjectMetadataItem = companyObjectMetadataItem,
  dashboardFilterValues = {
    [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.DATE]: DATE_SLOT_VALUE,
  },
}: {
  isDashboardFiltersEnabled?: boolean;
  pageLayoutType?: PageLayoutType;
  widgetObjectMetadataItem?: EnrichedObjectMetadataItem;
  dashboardFilterValues?: DashboardFilterValues;
}) => {
  const widgetConfiguration = buildConfiguration(widgetObjectMetadataItem);

  const graphWidget = {
    id: GRAPH_WIDGET_TEST_INSTANCE_ID,
    pageLayoutTabId: 'tab-1',
    title: 'Chart',
    type: WidgetType.GRAPH,
    objectMetadataId: widgetObjectMetadataItem.id,
    configuration: widgetConfiguration,
  } as unknown as PageLayoutWidget;

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
      dashboardFilterValues,
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

  const { result } = renderHook(
    () => useChartConfigurationWithDashboardFilters(widgetConfiguration),
    { wrapper },
  );

  return { result, widgetConfiguration };
};

const expectedDateRecordFilter = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) =>
  expect.objectContaining({
    id: 'dashboard-filter-slot-built-in-date',
    fieldMetadataId: getMockFieldMetadataItemOrThrow({
      objectMetadataItem,
      fieldName: 'createdAt',
    }).id,
    type: 'DATE_TIME',
    operand: ViewFilterOperand.IS_TODAY,
    value: '',
  });

describe('useChartConfigurationWithDashboardFilters', () => {
  it('returns the same configuration when the feature flag is off', () => {
    const { result, widgetConfiguration } =
      renderUseChartConfigurationWithDashboardFilters({
        isDashboardFiltersEnabled: false,
      });

    expect(result.current).toBe(widgetConfiguration);
  });

  it('appends the dashboard filter after the chart own filters without touching the input', () => {
    const { result, widgetConfiguration } =
      renderUseChartConfigurationWithDashboardFilters({});

    expect(result.current).not.toBe(widgetConfiguration);
    expect(result.current.filter.recordFilters).toEqual([
      CHART_OWN_RECORD_FILTER,
      expectedDateRecordFilter(companyObjectMetadataItem),
    ]);
    expect(widgetConfiguration.filter.recordFilters).toEqual([
      CHART_OWN_RECORD_FILTER,
    ]);
  });

  it('appends one root-level record filter per valued slot the widget binds', () => {
    const { result } = renderUseChartConfigurationWithDashboardFilters({
      dashboardFilterValues: {
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.DATE]: DATE_SLOT_VALUE,
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.OWNER]: OWNER_SLOT_VALUE,
      },
    });

    expect(result.current.filter.recordFilters).toEqual([
      CHART_OWN_RECORD_FILTER,
      expectedDateRecordFilter(companyObjectMetadataItem),
      expect.objectContaining({
        id: 'dashboard-filter-slot-built-in-owner',
        fieldMetadataId: accountOwnerFieldMetadataItem.id,
        type: 'RELATION',
        operand: ViewFilterOperand.IS,
        value: CURRENT_WORKSPACE_MEMBER_RELATION_VALUE,
      }),
    ]);
    expect(
      result.current.filter.recordFilters.every(
        (recordFilter: RecordFilter) =>
          recordFilter.recordFilterGroupId === undefined,
      ),
    ).toBe(true);
  });

  it('ignores a valued slot the widget object cannot bind', () => {
    const { result } = renderUseChartConfigurationWithDashboardFilters({
      widgetObjectMetadataItem: personObjectMetadataItem,
      dashboardFilterValues: {
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.DATE]: DATE_SLOT_VALUE,
        [BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.OWNER]: OWNER_SLOT_VALUE,
      },
    });

    expect(result.current.filter.recordFilters).toEqual([
      CHART_OWN_RECORD_FILTER,
      expectedDateRecordFilter(personObjectMetadataItem),
    ]);
  });

  it('returns the same configuration when the layout is not a dashboard', () => {
    const { result, widgetConfiguration } =
      renderUseChartConfigurationWithDashboardFilters({
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      });

    expect(result.current).toBe(widgetConfiguration);
  });
});
