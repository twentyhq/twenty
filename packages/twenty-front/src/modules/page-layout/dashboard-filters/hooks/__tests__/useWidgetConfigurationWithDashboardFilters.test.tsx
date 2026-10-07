import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInDateDashboardFilterSlotId';
import { BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInOwnerDashboardFilterSlotId';
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
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');
const noteObjectMetadataItem = getMockObjectMetadataItemOrThrow('note');

const getFieldByNameOrThrow = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  fieldName: string,
) => {
  const field = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(
      `Expected the ${objectMetadataItem.nameSingular} mock to have a ${fieldName} field`,
    );
  }

  return field;
};

const companyCreatedAtField = getFieldByNameOrThrow(
  companyObjectMetadataItem,
  'createdAt',
);
const personCreatedAtField = getFieldByNameOrThrow(
  personObjectMetadataItem,
  'createdAt',
);
const companyAccountOwnerField = getFieldByNameOrThrow(
  companyObjectMetadataItem,
  'accountOwner',
);
const taskAssigneeField = getFieldByNameOrThrow(
  taskObjectMetadataItem,
  'assignee',
);

// Opportunities lose createdAt so one chart has nothing to bind the date slot to.
const opportunityWithoutCreatedAt: EnrichedObjectMetadataItem = {
  ...opportunityObjectMetadataItem,
  fields: opportunityObjectMetadataItem.fields.filter(
    (field) => field.name !== 'createdAt',
  ),
};

const objectMetadataItemsWithoutOpportunityCreatedAt =
  getTestEnrichedObjectMetadataItemsMock().map((objectMetadataItem) =>
    objectMetadataItem.id === opportunityObjectMetadataItem.id
      ? opportunityWithoutCreatedAt
      : objectMetadataItem,
  );

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

const buildBarChartWidget = ({
  id,
  objectMetadataId,
  filter,
}: {
  id: string;
  objectMetadataId: string;
  filter?: {
    recordFilters: RecordFilter[];
    recordFilterGroups: (typeof existingRecordFilterGroup)[];
  };
}) =>
  buildDraftPageLayoutWidget({
    id,
    pageLayoutTabId: 'tab-1',
    title: id,
    type: WidgetType.GRAPH,
    configuration: { ...buildDefaultBarChartConfiguration({}), filter },
    position: {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: 2,
      columnSpan: 2,
    },
    objectMetadataId,
  });

const companyWidget = buildBarChartWidget({
  id: 'company-widget',
  objectMetadataId: companyObjectMetadataItem.id,
  filter: {
    recordFilters: [existingRecordFilter],
    recordFilterGroups: [existingRecordFilterGroup],
  },
});

const personWidget = buildBarChartWidget({
  id: 'person-widget',
  objectMetadataId: personObjectMetadataItem.id,
});

const opportunityWidget = buildBarChartWidget({
  id: 'opportunity-widget',
  objectMetadataId: opportunityObjectMetadataItem.id,
});

const taskWidget = buildBarChartWidget({
  id: 'task-widget',
  objectMetadataId: taskObjectMetadataItem.id,
});

const noteWidget = buildBarChartWidget({
  id: 'note-widget',
  objectMetadataId: noteObjectMetadataItem.id,
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

const DATE_VALUES = { [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: DATE_VALUE };

const OWNER_ME_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: true,
    selectedRecordIds: [],
  }),
};

const OWNER_ME_VALUES = {
  [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: OWNER_ME_VALUE,
};

const renderWithDashboard = async <THookResult,>({
  isDashboardFiltersEnabled = true,
  pageLayoutType = PageLayoutType.DASHBOARD,
  dashboardFilterValues = {},
  widgets = [companyWidget],
  objectMetadataItems,
  useHookUnderTest,
}: {
  isDashboardFiltersEnabled?: boolean;
  pageLayoutType?: PageLayoutType;
  dashboardFilterValues?: Record<string, DashboardFilterValue | undefined>;
  widgets?: PageLayoutWidget[];
  objectMetadataItems?: EnrichedObjectMetadataItem[];
  useHookUnderTest: () => THookResult;
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
      tabs: [makeTab('tab-1', widgets, 0, PageLayoutTabLayoutMode.GRID)],
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
        <JestObjectMetadataItemSetter objectMetadataItems={objectMetadataItems}>
          <PageLayoutTestWrapper store={jotaiStore} layoutType={pageLayoutType}>
            {children}
          </PageLayoutTestWrapper>
        </JestObjectMetadataItemSetter>
      </JotaiProvider>
    </I18nProvider>
  );

  const renderResult = renderHook(useHookUnderTest, { wrapper: Wrapper });

  await waitFor(() => expect(renderResult.result.current).toBeDefined());

  return renderResult;
};

describe('useWidgetConfigurationWithDashboardFilters', () => {
  it('returns the widget configuration untouched when no slot has a value', async () => {
    const { result } = await renderWithDashboard({
      useHookUnderTest: () =>
        useWidgetConfigurationWithDashboardFilters(companyWidget),
    });

    expect(result.current).toBe(companyWidget.configuration);
  });

  it('appends one root-level record filter per valued slot and keeps groups intact', async () => {
    const { result } = await renderWithDashboard({
      dashboardFilterValues: DATE_VALUES,
      useHookUnderTest: () =>
        useWidgetConfigurationWithDashboardFilters(companyWidget),
    });

    expect(result.current).not.toBe(companyWidget.configuration);
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
    await renderWithDashboard({
      dashboardFilterValues: DATE_VALUES,
      useHookUnderTest: () =>
        useWidgetConfigurationWithDashboardFilters(companyWidget),
    });

    expect(getChartFilter(companyWidget.configuration).recordFilters).toEqual([
      existingRecordFilter,
    ]);
  });

  it('filters every chart whose object has createdAt and leaves the others untouched', async () => {
    const { result } = await renderWithDashboard({
      dashboardFilterValues: DATE_VALUES,
      widgets: [companyWidget, personWidget, opportunityWidget],
      objectMetadataItems: objectMetadataItemsWithoutOpportunityCreatedAt,
      useHookUnderTest: () => ({
        company: useWidgetConfigurationWithDashboardFilters(companyWidget),
        person: useWidgetConfigurationWithDashboardFilters(personWidget),
        opportunity:
          useWidgetConfigurationWithDashboardFilters(opportunityWidget),
      }),
    });

    const companyRecordFilters = getChartFilter(
      result.current.company,
    ).recordFilters;
    const personRecordFilters = getChartFilter(
      result.current.person,
    ).recordFilters;

    expect(companyRecordFilters).toHaveLength(2);
    expect(companyRecordFilters[1].fieldMetadataId).toBe(
      companyCreatedAtField.id,
    );
    expect(personRecordFilters).toHaveLength(1);
    expect(personRecordFilters[0].fieldMetadataId).toBe(
      personCreatedAtField.id,
    );
    expect(result.current.opportunity).toBe(opportunityWidget.configuration);
  });

  it('appends the date and owner filters as two ungrouped root filters so they combine with AND', async () => {
    const { result } = await renderWithDashboard({
      dashboardFilterValues: { ...DATE_VALUES, ...OWNER_ME_VALUES },
      useHookUnderTest: () =>
        useWidgetConfigurationWithDashboardFilters(companyWidget),
    });

    const recordFilters = getChartFilter(result.current).recordFilters;

    expect(recordFilters).toEqual([
      existingRecordFilter,
      expect.objectContaining({
        id: `dashboard-filter-${BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID}`,
        fieldMetadataId: companyCreatedAtField.id,
        type: 'DATE_TIME',
        operand: ViewFilterOperand.IS_AFTER,
        value: DATE_VALUE.value,
      }),
      expect.objectContaining({
        id: `dashboard-filter-${BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID}`,
        fieldMetadataId: companyAccountOwnerField.id,
        type: 'RELATION',
        operand: ViewFilterOperand.IS,
        value: OWNER_ME_VALUE.value,
        relationTargetFieldMetadataId: null,
      }),
    ]);
    expect(
      recordFilters
        ?.slice(1)
        .every(
          (recordFilter: RecordFilter) =>
            !isDefined(recordFilter.recordFilterGroupId),
        ),
    ).toBe(true);
  });

  it('binds owner to accountOwner on companies and assignee on tasks and leaves notes untouched', async () => {
    const { result } = await renderWithDashboard({
      dashboardFilterValues: OWNER_ME_VALUES,
      widgets: [companyWidget, taskWidget, noteWidget],
      useHookUnderTest: () => ({
        company: useWidgetConfigurationWithDashboardFilters(companyWidget),
        task: useWidgetConfigurationWithDashboardFilters(taskWidget),
        note: useWidgetConfigurationWithDashboardFilters(noteWidget),
      }),
    });

    const companyRecordFilters = getChartFilter(
      result.current.company,
    ).recordFilters;
    const taskRecordFilters = getChartFilter(result.current.task).recordFilters;

    expect(companyRecordFilters).toHaveLength(2);
    expect(companyRecordFilters?.[1]?.fieldMetadataId).toBe(
      companyAccountOwnerField.id,
    );
    expect(taskRecordFilters).toHaveLength(1);
    expect(taskRecordFilters?.[0]?.fieldMetadataId).toBe(taskAssigneeField.id);
    expect(taskRecordFilters?.[0]?.value).toBe(OWNER_ME_VALUE.value);
    expect(result.current.note).toBe(noteWidget.configuration);
  });

  it('returns the widget configuration untouched when the feature flag is off', async () => {
    const { result } = await renderWithDashboard({
      isDashboardFiltersEnabled: false,
      dashboardFilterValues: DATE_VALUES,
      useHookUnderTest: () =>
        useWidgetConfigurationWithDashboardFilters(companyWidget),
    });

    expect(result.current).toBe(companyWidget.configuration);
  });

  it('returns the widget configuration untouched outside dashboards', async () => {
    const { result } = await renderWithDashboard({
      pageLayoutType: PageLayoutType.RECORD_PAGE,
      dashboardFilterValues: DATE_VALUES,
      useHookUnderTest: () =>
        useWidgetConfigurationWithDashboardFilters(companyWidget),
    });

    expect(result.current).toBe(companyWidget.configuration);
  });
});
