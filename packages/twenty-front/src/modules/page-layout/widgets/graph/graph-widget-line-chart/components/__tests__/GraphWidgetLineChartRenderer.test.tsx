import { dashboardFilterCrossFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterValuesComponentState';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { GraphWidgetLineChartRenderer } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChartRenderer';
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
  AggregateOperations,
  type LineChartConfiguration,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// The chart data comes from Apollo; the renderer only needs points and their raw values.
const mockUseGraphLineChartWidgetData = jest.fn();

jest.mock(
  '@/page-layout/widgets/graph/graph-widget-line-chart/hooks/useGraphLineChartWidgetData',
  () => ({
    useGraphLineChartWidgetData: (...args: unknown[]) =>
      mockUseGraphLineChartWidgetData(...args),
  }),
);

// nivo cannot lay out in jsdom; a button per point stands in for a point on the line.
jest.mock(
  '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChart',
  () => ({
    GraphWidgetLineChart: ({
      data,
      onSliceClick,
    }: {
      data: { id: string; data: { x: string; y: number }[] }[];
      onSliceClick?: (point: { data: { x: string; y: number } }) => void;
    }) => (
      <div>
        {data.flatMap((series) =>
          series.data.map((point) => (
            <button
              key={`${series.id}-${point.x}`}
              type="button"
              disabled={onSliceClick === undefined}
              onClick={() => onSliceClick?.({ data: point })}
            >
              {point.x}
            </button>
          )),
        )}
      </div>
    ),
  }),
);

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const stageField = opportunityObjectMetadataItem.fields.find(
  (field) => field.name === 'stage',
);

if (!isDefined(stageField)) {
  throw new Error('Expected the opportunity mock to have a stage field');
}

const STAGE_SLOT: DashboardFilterSlot = {
  id: 'stage-slot',
  label: 'Stage',
  filterType: 'SELECT',
};

const WIDGET_ID = 'opportunity-line-widget';

const dashboardFilterValuesAtom =
  dashboardFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const dashboardFilterCrossFilterValuesAtom =
  dashboardFilterCrossFilterValuesComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

const renderLineChartRenderer = async ({
  slots,
}: {
  slots: DashboardFilterSlot[];
}) => {
  resetJotaiStore();
  mockNavigate.mockReset();

  mockUseGraphLineChartWidgetData.mockReturnValue({
    series: [{ id: 'count', label: 'Count', data: [{ x: 'New', y: 3 }] }],
    showDataLabels: false,
    showLegend: false,
    hasTooManyGroups: false,
    formattedToRawLookup: new Map([['New', 'NEW']]),
    colorMode: 'automaticPalette',
    xAxisLabel: '',
    yAxisLabel: '',
    loading: false,
    error: undefined,
    objectMetadataItem: opportunityObjectMetadataItem,
  });

  const widget = buildDraftPageLayoutWidget({
    id: WIDGET_ID,
    pageLayoutTabId: 'tab-1',
    title: 'Opportunities by stage',
    type: WidgetType.GRAPH,
    configuration: {
      __typename: 'LineChartConfiguration',
      configurationType: WidgetConfigurationType.LINE_CHART,
      aggregateOperation: AggregateOperations.COUNT,
      aggregateFieldMetadataId: stageField.id,
      primaryAxisGroupByFieldMetadataId: stageField.id,
      dashboardFilterBindings: {
        [STAGE_SLOT.id]: { fieldMetadataId: stageField.id },
      },
    } satisfies LineChartConfiguration,
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
                <GraphWidgetLineChartRenderer widget={widget} />
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

describe('GraphWidgetLineChartRenderer point click', () => {
  it('offers to filter the dashboard by a point that matches a slot and sets that slot', async () => {
    await renderLineChartRenderer({ slots: [STAGE_SLOT] });

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

  it('navigates straight away when no slot matches the point', async () => {
    await renderLineChartRenderer({ slots: [] });

    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'New' }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(opportunityObjectMetadataItem.namePlural),
    );
    expect(
      screen.queryByText('Filter dashboard by this'),
    ).not.toBeInTheDocument();
  });
});
