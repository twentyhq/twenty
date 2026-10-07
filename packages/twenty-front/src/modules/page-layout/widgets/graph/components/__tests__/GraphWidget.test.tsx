import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const BAR_CHART_RENDERER_TEST_ID = 'bar-chart-renderer';

// The renderer owns the chart data hooks, so its mount is what the gate must prevent.
jest.mock(
  '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChartRenderer',
  () => ({
    GraphWidgetBarChartRenderer: () => <div data-testid="bar-chart-renderer" />,
  }),
);

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

const COMPANY_NAME_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
};

const companyChartWidget = buildDraftPageLayoutWidget({
  id: 'company-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Companies',
  type: WidgetType.GRAPH,
  configuration: {
    ...buildDefaultBarChartConfiguration({}),
    dashboardFilterBindings: {
      [REQUIRED_SLOT.id]: { fieldMetadataId: companyNameField.id },
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

const renderGraphWidget = async ({
  dashboardFilterValues,
  isInEditMode = false,
}: {
  dashboardFilterValues: Record<string, DashboardFilterValue | undefined>;
  isInEditMode?: boolean;
}) => {
  resetJotaiStore();

  jotaiStore.set(
    isDashboardInEditModeComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    isInEditMode,
  );

  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    {
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      dashboardFilters: [REQUIRED_SLOT],
      tabs: [
        makeTab('tab-1', [companyChartWidget], 0, PageLayoutTabLayoutMode.GRID),
      ],
    } as PageLayout,
  );

  jotaiStore.set(
    dashboardFilterValuesComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    dashboardFilterValues,
  );

  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <JotaiProvider store={jotaiStore}>
          <JestObjectMetadataItemSetter>
            <PageLayoutTestWrapper
              store={jotaiStore}
              layoutType={PageLayoutType.DASHBOARD}
            >
              <WidgetComponentInstanceContext.Provider
                value={{ instanceId: companyChartWidget.id }}
              >
                <GraphWidget />
              </WidgetComponentInstanceContext.Provider>
              <div data-testid="metadata-loaded" />
            </PageLayoutTestWrapper>
          </JestObjectMetadataItemSetter>
        </JotaiProvider>
      </ThemeProvider>
    </I18nProvider>,
  );

  await screen.findByTestId('metadata-loaded');
};

describe('GraphWidget', () => {
  it('shows a status instead of the chart while a bound required filter is unset', async () => {
    await renderGraphWidget({ dashboardFilterValues: {} });

    expect(
      screen.getByText('Set the Company name filter to see this chart'),
    ).toBeVisible();
    expect(
      screen.queryByTestId(BAR_CHART_RENDERER_TEST_ID),
    ).not.toBeInTheDocument();
  });

  it('renders the chart once the required filter has a value', async () => {
    await renderGraphWidget({
      dashboardFilterValues: { [REQUIRED_SLOT.id]: COMPANY_NAME_VALUE },
    });

    expect(screen.getByTestId(BAR_CHART_RENDERER_TEST_ID)).toBeInTheDocument();
    expect(
      screen.queryByText('Set the Company name filter to see this chart'),
    ).not.toBeInTheDocument();
  });

  it('keeps rendering the chart in edit mode while the required filter is unset', async () => {
    await renderGraphWidget({ dashboardFilterValues: {}, isInEditMode: true });

    expect(screen.getByTestId(BAR_CHART_RENDERER_TEST_ID)).toBeInTheDocument();
    expect(
      screen.queryByText('Set the Company name filter to see this chart'),
    ).not.toBeInTheDocument();
  });
});
