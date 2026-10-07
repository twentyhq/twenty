import { useMissingRequiredDashboardFilterSlot } from '@/page-layout/dashboard-filters/hooks/useMissingRequiredDashboardFilterSlot';
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
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const companyNameField = companyObjectMetadataItem.fields.find(
  (field) => field.name === 'name',
);

if (!isDefined(companyNameField)) {
  throw new Error('Expected the company mock to have a name field');
}

const REQUIRED_SLOT: DashboardFilterSlot = {
  id: 'company-name',
  label: 'Company name',
  filterType: 'TEXT',
  isRequired: true,
};

const OPTIONAL_SLOT: DashboardFilterSlot = {
  ...REQUIRED_SLOT,
  isRequired: false,
};

const COMPANY_NAME_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
};

const buildCompanyChartWidget = (
  dashboardFilterBindings: Record<string, DashboardFilterBinding | null>,
) =>
  buildDraftPageLayoutWidget({
    id: 'company-widget',
    pageLayoutTabId: 'tab-1',
    title: 'Companies',
    type: WidgetType.GRAPH,
    configuration: {
      ...buildDefaultBarChartConfiguration({}),
      dashboardFilterBindings,
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

const boundWidget = buildCompanyChartWidget({
  [REQUIRED_SLOT.id]: { fieldMetadataId: companyNameField.id },
});

const unboundWidget = buildCompanyChartWidget({ [REQUIRED_SLOT.id]: null });

const renderMissingRequiredSlot = async ({
  slots,
  widget,
  dashboardFilterValues = {},
}: {
  slots: DashboardFilterSlot[];
  widget: PageLayoutWidget;
  dashboardFilterValues?: Record<string, DashboardFilterValue | undefined>;
}) => {
  resetJotaiStore();

  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    {
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      dashboardFilters: slots,
      tabs: [makeTab('tab-1', [widget], 0, PageLayoutTabLayoutMode.GRID)],
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
          <PageLayoutTestWrapper
            store={jotaiStore}
            layoutType={PageLayoutType.DASHBOARD}
          >
            {children}
          </PageLayoutTestWrapper>
        </JestObjectMetadataItemSetter>
      </JotaiProvider>
    </I18nProvider>
  );

  const renderResult = renderHook(
    () => useMissingRequiredDashboardFilterSlot(widget),
    { wrapper: Wrapper },
  );

  await waitFor(() => expect(renderResult.result.current).not.toBeUndefined());

  return renderResult;
};

describe('useMissingRequiredDashboardFilterSlot', () => {
  it('returns the required slot when the chart is bound to it and it has no value', async () => {
    const { result } = await renderMissingRequiredSlot({
      slots: [REQUIRED_SLOT],
      widget: boundWidget,
    });

    expect(result.current).toEqual(REQUIRED_SLOT);
  });

  it('returns null when the chart is not bound to the required slot', async () => {
    const { result } = await renderMissingRequiredSlot({
      slots: [REQUIRED_SLOT],
      widget: unboundWidget,
    });

    expect(result.current).toBeNull();
  });

  it('returns null once the required slot has a value', async () => {
    const { result } = await renderMissingRequiredSlot({
      slots: [REQUIRED_SLOT],
      widget: boundWidget,
      dashboardFilterValues: { [REQUIRED_SLOT.id]: COMPANY_NAME_VALUE },
    });

    expect(result.current).toBeNull();
  });

  it('returns null when the bound slot is not required', async () => {
    const { result } = await renderMissingRequiredSlot({
      slots: [OPTIONAL_SLOT],
      widget: boundWidget,
    });

    expect(result.current).toBeNull();
  });
});
