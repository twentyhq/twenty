import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInDateDashboardFilterSlotId';
import { useWidgetConfigurationWithDashboardFilters } from '@/page-layout/dashboard-filters/hooks/useWidgetConfigurationWithDashboardFilters';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import {
  type DashboardFilterValue,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const companyCreatedAtField = companyObjectMetadataItem.fields.find(
  (field) => field.name === 'createdAt',
);

if (!isDefined(companyCreatedAtField)) {
  throw new Error('Expected the company mock to have a createdAt field');
}

const existingRecordFilter: RecordFilter = {
  id: 'existing-filter',
  fieldMetadataId: companyObjectMetadataItem.fields[0].id,
  value: 'Acme',
  displayValue: 'Acme',
  type: 'TEXT',
  operand: ViewFilterOperand.CONTAINS,
  label: 'Name',
  recordFilterGroupId: 'existing-group',
};

const existingRecordFilterGroup = {
  id: 'existing-group',
  logicalOperator: RecordFilterGroupLogicalOperator.AND,
};

const barChartWidget = buildDraftPageLayoutWidget({
  id: 'bar-chart-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Companies',
  type: WidgetType.GRAPH,
  configuration: {
    ...buildDefaultBarChartConfiguration({}),
    filter: {
      recordFilters: [existingRecordFilter],
      recordFilterGroups: [existingRecordFilterGroup],
    },
  },
  position: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 2,
    columnSpan: 2,
  },
  objectMetadataId: companyObjectMetadataItem.id,
});

const getChartFilter = (configuration: PageLayoutWidget['configuration']) => {
  if (!isWidgetConfigurationOfTypeGraph(configuration)) {
    throw new Error('Expected a chart configuration');
  }

  return configuration.filter;
};

const DATE_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS_AFTER,
  value: '2026-01-01T00:00:00.000Z',
};

const renderUseWidgetConfigurationWithDashboardFilters = async ({
  isDashboardFiltersEnabled = true,
  pageLayoutType = PageLayoutType.DASHBOARD,
  dashboardFilterValues = {},
}: {
  isDashboardFiltersEnabled?: boolean;
  pageLayoutType?: PageLayoutType;
  dashboardFilterValues?: Record<string, DashboardFilterValue | undefined>;
}) => {
  resetJotaiStore();

  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
        value: isDashboardFiltersEnabled,
      },
    ],
  });

  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    {
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      name: 'Dashboard',
      type: pageLayoutType,
      objectMetadataId: null,
      tabs: [
        makeTab('tab-1', [barChartWidget], 0, PageLayoutTabLayoutMode.GRID),
      ],
    } as PageLayout,
  );

  jotaiStore.set(
    dashboardFilterValuesComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    dashboardFilterValues,
  );

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <JestObjectMetadataItemSetter>
          <PageLayoutTestWrapper store={jotaiStore} layoutType={pageLayoutType}>
            {children}
          </PageLayoutTestWrapper>
        </JestObjectMetadataItemSetter>
      </JotaiProvider>
    </I18nProvider>
  );

  const renderResult = renderHook(
    () => useWidgetConfigurationWithDashboardFilters(barChartWidget),
    { wrapper: Wrapper },
  );

  await waitFor(() => expect(renderResult.result.current).toBeDefined());

  return renderResult;
};

describe('useWidgetConfigurationWithDashboardFilters', () => {
  it('returns the widget configuration untouched when no slot has a value', async () => {
    const { result } = await renderUseWidgetConfigurationWithDashboardFilters(
      {},
    );

    expect(result.current).toBe(barChartWidget.configuration);
  });

  it('appends one root-level record filter per valued slot and keeps groups intact', async () => {
    const { result } = await renderUseWidgetConfigurationWithDashboardFilters({
      dashboardFilterValues: {
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: DATE_VALUE,
      },
    });

    expect(result.current).not.toBe(barChartWidget.configuration);
    expect(getChartFilter(result.current).recordFilters).toEqual([
      existingRecordFilter,
      {
        id: `dashboard-filter-${BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID}`,
        fieldMetadataId: companyCreatedAtField.id,
        type: 'DATE_TIME',
        operand: ViewFilterOperand.IS_AFTER,
        value: DATE_VALUE.value,
        subFieldName: undefined,
        relationTargetFieldMetadataId: null,
      },
    ]);
    expect(getChartFilter(result.current).recordFilterGroups).toEqual([
      existingRecordFilterGroup,
    ]);
  });

  it('does not mutate the widget configuration it was given', async () => {
    await renderUseWidgetConfigurationWithDashboardFilters({
      dashboardFilterValues: {
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: DATE_VALUE,
      },
    });

    expect(getChartFilter(barChartWidget.configuration).recordFilters).toEqual([
      existingRecordFilter,
    ]);
  });

  it('returns the widget configuration untouched when the feature flag is off', async () => {
    const { result } = await renderUseWidgetConfigurationWithDashboardFilters({
      isDashboardFiltersEnabled: false,
      dashboardFilterValues: {
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: DATE_VALUE,
      },
    });

    expect(result.current).toBe(barChartWidget.configuration);
  });

  it('returns the widget configuration untouched outside dashboards', async () => {
    const { result } = await renderUseWidgetConfigurationWithDashboardFilters({
      pageLayoutType: PageLayoutType.RECORD_PAGE,
      dashboardFilterValues: {
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: DATE_VALUE,
      },
    });

    expect(result.current).toBe(barChartWidget.configuration);
  });
});
