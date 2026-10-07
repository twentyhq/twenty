import { dashboardFilterCrossFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterValuesComponentState';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { GraphWidgetBarChartRenderer } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChartRenderer';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  type BarChartConfiguration,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// The chart data comes from Apollo; the renderer only needs buckets and their raw values.
const mockUseGraphBarChartWidgetData = jest.fn();

jest.mock(
  '@/page-layout/widgets/graph/graph-widget-bar-chart/hooks/useGraphBarChartWidgetData',
  () => ({
    useGraphBarChartWidgetData: (...args: unknown[]) =>
      mockUseGraphBarChartWidgetData(...args),
  }),
);

// nivo cannot lay out in jsdom; a button per bucket stands in for a bar.
jest.mock(
  '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChart',
  () => ({
    GraphWidgetBarChart: ({
      data,
      indexBy,
      onSliceClick,
    }: {
      data: Record<string, string | number>[];
      indexBy: string;
      onSliceClick?: (slice: {
        indexValue: string;
        bars: never[];
        sliceLeft: number;
        sliceRight: number;
        sliceCenter: number;
      }) => void;
    }) => (
      <div>
        {data.map((datum) => {
          const indexValue = String(datum[indexBy]);

          return (
            <button
              key={indexValue}
              type="button"
              disabled={onSliceClick === undefined}
              onClick={() =>
                onSliceClick?.({
                  indexValue,
                  bars: [],
                  sliceLeft: 0,
                  sliceRight: 0,
                  sliceCenter: 0,
                })
              }
            >
              {indexValue}
            </button>
          );
        })}
      </div>
    ),
  }),
);

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const getOpportunityFieldOrThrow = (fieldName: string) => {
  const field = opportunityObjectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(
      `Expected the opportunity mock to have a ${fieldName} field`,
    );
  }

  return field;
};

const stageField = getOpportunityFieldOrThrow('stage');
const companyField = getOpportunityFieldOrThrow('company');

const ACME_COMPANY_ID = '20202020-0000-4000-8000-00000000ac3e';

const STAGE_SLOT: DashboardFilterSlot = {
  id: 'stage-slot',
  label: 'Stage',
  filterType: 'SELECT',
};

const COMPANY_SLOT: DashboardFilterSlot = {
  id: 'company-slot',
  label: 'Company',
  filterType: 'RELATION',
};

const WIDGET_ID = 'opportunity-widget';

const dashboardFilterValuesAtom =
  dashboardFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const dashboardFilterCrossFilterValuesAtom =
  dashboardFilterCrossFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const renderBarChartRenderer = async ({
  slots,
  configuration,
  buckets,
}: {
  slots: DashboardFilterSlot[];
  configuration: BarChartConfiguration;
  buckets: { label: string; rawValue: RawDimensionValue }[];
}) => {
  resetJotaiStore();
  mockNavigate.mockReset();

  mockUseGraphBarChartWidgetData.mockReturnValue({
    data: buckets.map((bucket) => ({ bucket: bucket.label, count: 1 })),
    indexBy: 'bucket',
    keys: ['count'],
    series: [],
    xAxisLabel: '',
    yAxisLabel: '',
    showDataLabels: false,
    showLegend: false,
    layout: undefined,
    groupMode: undefined,
    loading: false,
    isRefetching: false,
    error: undefined,
    hasTooManyGroups: false,
    formattedToRawLookup: new Map(
      buckets.map((bucket) => [bucket.label, bucket.rawValue]),
    ),
    colorMode: 'automaticPalette',
    objectMetadataItem: opportunityObjectMetadataItem,
  });

  const widget = buildDraftPageLayoutWidget({
    id: WIDGET_ID,
    pageLayoutTabId: 'tab-1',
    title: 'Opportunities',
    type: WidgetType.GRAPH,
    configuration,
    position: {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: 2,
      columnSpan: 2,
    },
    objectMetadataId: opportunityObjectMetadataItem.id,
  });

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
                value={{ instanceId: WIDGET_ID }}
              >
                <GraphWidgetBarChartRenderer widget={widget} />
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

const STAGE_CHART_CONFIGURATION: BarChartConfiguration = {
  ...buildDefaultBarChartConfiguration({}),
  primaryAxisGroupByFieldMetadataId: stageField.id,
  dashboardFilterBindings: {
    [STAGE_SLOT.id]: { fieldMetadataId: stageField.id },
  },
};

const STAGE_BUCKETS = [{ label: 'New', rawValue: 'NEW' }];

describe('GraphWidgetBarChartRenderer bucket click', () => {
  it('offers to filter the dashboard by a bucket that matches a slot and sets that slot', async () => {
    await renderBarChartRenderer({
      slots: [STAGE_SLOT],
      configuration: STAGE_CHART_CONFIGURATION,
      buckets: STAGE_BUCKETS,
    });

    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'New' }));
    await user.click(await screen.findByText('Filter dashboard by this'));

    const expectedValue = {
      operand: ViewFilterOperand.IS,
      value: JSON.stringify(['NEW']),
    };

    await waitFor(() =>
      expect(jotaiStore.get(dashboardFilterValuesAtom)[STAGE_SLOT.id]).toEqual(
        expectedValue,
      ),
    );
    expect(
      jotaiStore.get(dashboardFilterCrossFilterValuesAtom)[STAGE_SLOT.id],
    ).toEqual(expectedValue);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('keeps the drilldown available from the same menu', async () => {
    await renderBarChartRenderer({
      slots: [STAGE_SLOT],
      configuration: STAGE_CHART_CONFIGURATION,
      buckets: STAGE_BUCKETS,
    });

    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'New' }));
    await user.click(await screen.findByText('Open records'));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(opportunityObjectMetadataItem.namePlural),
    );
    expect(
      jotaiStore.get(dashboardFilterValuesAtom)[STAGE_SLOT.id],
    ).toBeUndefined();
  });

  it('navigates straight away when no slot matches the bucket', async () => {
    await renderBarChartRenderer({
      slots: [],
      configuration: STAGE_CHART_CONFIGURATION,
      buckets: STAGE_BUCKETS,
    });

    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'New' }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText('Filter dashboard by this'),
    ).not.toBeInTheDocument();
  });

  it('cross-filters a relation bucket through the relation slot without offering a drilldown', async () => {
    await renderBarChartRenderer({
      slots: [COMPANY_SLOT],
      configuration: {
        ...buildDefaultBarChartConfiguration({}),
        primaryAxisGroupByFieldMetadataId: companyField.id,
        dashboardFilterBindings: {
          [COMPANY_SLOT.id]: { fieldMetadataId: companyField.id },
        },
      },
      buckets: [{ label: 'Acme', rawValue: ACME_COMPANY_ID }],
    });

    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Acme' }));
    await user.click(await screen.findByText('Filter dashboard by this'));

    expect(screen.queryByText('Open records')).not.toBeInTheDocument();

    await waitFor(() =>
      expect(
        jotaiStore.get(dashboardFilterValuesAtom)[COMPANY_SLOT.id]?.operand,
      ).toBe(ViewFilterOperand.IS),
    );
    expect(
      JSON.parse(
        jotaiStore.get(dashboardFilterValuesAtom)[COMPANY_SLOT.id]?.value ?? '',
      ),
    ).toEqual({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: [ACME_COMPANY_ID],
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
