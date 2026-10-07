import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInDateDashboardFilterSlotId';
import { BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInOwnerDashboardFilterSlotId';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
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
  type DashboardFilterBinding,
  type DashboardFilterSlot,
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

const getFieldIdByNameOrThrow = (fieldName: string) => {
  const field = companyObjectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected the company mock to have a ${fieldName} field`);
  }

  return field.id;
};

const companyCreatedAtFieldId = getFieldIdByNameOrThrow('createdAt');
const companyAccountOwnerFieldId = getFieldIdByNameOrThrow('accountOwner');
const companyNameFieldId = getFieldIdByNameOrThrow('name');

const PERSISTED_SLOTS: DashboardFilterSlot[] = [
  {
    id: 'closing-month',
    label: 'Closing month',
    filterType: 'DATE',
    defaultOperand: ViewFilterOperand.IS_RELATIVE,
    defaultValue: 'THIS_1_MONTH',
  },
  {
    id: 'company-name',
    label: 'Company name',
    filterType: 'TEXT',
  },
];

const PERSISTED_BINDINGS: Record<string, DashboardFilterBinding | null> = {
  'closing-month': { fieldMetadataId: companyCreatedAtFieldId },
  'company-name': { fieldMetadataId: companyNameFieldId },
};

const buildBarChartWidget = ({
  id,
  dashboardFilterBindings,
}: {
  id: string;
  dashboardFilterBindings?: Record<string, DashboardFilterBinding | null>;
}) =>
  buildDraftPageLayoutWidget({
    id,
    pageLayoutTabId: 'tab-1',
    title: id,
    type: WidgetType.GRAPH,
    configuration: {
      ...buildDefaultBarChartConfiguration({}),
      ...(isDefined(dashboardFilterBindings)
        ? { dashboardFilterBindings }
        : {}),
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

const boundWidget = buildBarChartWidget({
  id: 'bound-widget',
  dashboardFilterBindings: PERSISTED_BINDINGS,
});

const optedOutWidget = buildBarChartWidget({
  id: 'opted-out-widget',
  dashboardFilterBindings: { 'closing-month': null },
});

const widgetWithoutBindings = buildBarChartWidget({
  id: 'widget-without-bindings',
});

const renderUseDashboardFilterSlots = async ({
  isDashboardFiltersEnabled = true,
  pageLayoutType = PageLayoutType.DASHBOARD,
  dashboardFilters,
  widgets,
}: {
  isDashboardFiltersEnabled?: boolean;
  pageLayoutType?: PageLayoutType;
  dashboardFilters: DashboardFilterSlot[] | null;
  widgets: PageLayoutWidget[];
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
      dashboardFilters,
      tabs: [makeTab('tab-1', widgets, 0, PageLayoutTabLayoutMode.GRID)],
    } as PageLayout,
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

  const renderResult = renderHook(() => useDashboardFilterSlots(), {
    wrapper: Wrapper,
  });

  await waitFor(() => expect(renderResult.result.current).toBeDefined());

  return renderResult;
};

describe('useDashboardFilterSlots', () => {
  it('returns the saved slots and each chart widget saved bindings when the layout has dashboard filters', async () => {
    const { result } = await renderUseDashboardFilterSlots({
      dashboardFilters: PERSISTED_SLOTS,
      widgets: [boundWidget, optedOutWidget],
    });

    expect(result.current.slots).toEqual(PERSISTED_SLOTS);
    expect(result.current.bindingsByWidgetId).toEqual({
      'bound-widget': PERSISTED_BINDINGS,
      'opted-out-widget': { 'closing-month': null },
    });
  });

  it('leaves a chart widget without a bindings entry out of the saved bindings', async () => {
    const { result } = await renderUseDashboardFilterSlots({
      dashboardFilters: PERSISTED_SLOTS,
      widgets: [boundWidget, widgetWithoutBindings],
    });

    expect(result.current.bindingsByWidgetId).toEqual({
      'bound-widget': PERSISTED_BINDINGS,
    });
    expect(result.current.bindingsByWidgetId).not.toHaveProperty(
      'widget-without-bindings',
    );
  });

  it('returns the saved empty slot list instead of the built-ins once a dashboard was configured', async () => {
    const { result } = await renderUseDashboardFilterSlots({
      dashboardFilters: [],
      widgets: [widgetWithoutBindings],
    });

    expect(result.current.slots).toEqual([]);
    expect(result.current.bindingsByWidgetId).toEqual({});
  });

  it('falls back to the built-in slots and bindings when the layout has no dashboard filters', async () => {
    const { result } = await renderUseDashboardFilterSlots({
      dashboardFilters: null,
      widgets: [widgetWithoutBindings],
    });

    expect(result.current.slots.map((slot) => slot.id)).toEqual([
      BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID,
      BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID,
    ]);
    expect(result.current.slots.map((slot) => slot.label)).toEqual([
      'Date',
      'Owner',
    ]);
    expect(result.current.bindingsByWidgetId).toEqual({
      'widget-without-bindings': {
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: companyCreatedAtFieldId,
        },
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
          fieldMetadataId: companyAccountOwnerFieldId,
        },
      },
    });
  });

  it('ignores saved widget bindings while the layout falls back to the built-ins', async () => {
    const { result } = await renderUseDashboardFilterSlots({
      dashboardFilters: null,
      widgets: [boundWidget],
    });

    expect(result.current.bindingsByWidgetId['bound-widget']).toEqual({
      [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: {
        fieldMetadataId: companyCreatedAtFieldId,
      },
      [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: {
        fieldMetadataId: companyAccountOwnerFieldId,
      },
    });
  });

  it('returns nothing when the feature flag is off', async () => {
    const { result } = await renderUseDashboardFilterSlots({
      isDashboardFiltersEnabled: false,
      dashboardFilters: PERSISTED_SLOTS,
      widgets: [boundWidget],
    });

    expect(result.current.slots).toEqual([]);
    expect(result.current.bindingsByWidgetId).toEqual({});
  });

  it('returns nothing outside dashboards', async () => {
    const { result } = await renderUseDashboardFilterSlots({
      pageLayoutType: PageLayoutType.RECORD_PAGE,
      dashboardFilters: PERSISTED_SLOTS,
      widgets: [boundWidget],
    });

    expect(result.current.slots).toEqual([]);
    expect(result.current.bindingsByWidgetId).toEqual({});
  });
});
