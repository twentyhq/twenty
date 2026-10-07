import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { hasInitializedDashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/hasInitializedDashboardFilterValuesComponentState';
import { buildChartWidget } from '@/page-layout/dashboard-filters/testing/dashboardFilterTestFixtures';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import {
  GRAPH_WIDGET_TEST_INSTANCE_ID,
  GraphWidgetTestWrapper,
  PAGE_LAYOUT_TEST_INSTANCE_ID,
} from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type Store } from 'jotai/vanilla/store';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockBarChartRenderer = jest.fn(() => (
  <div data-testid="bar-chart-renderer" />
));

jest.mock(
  '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChartRenderer',
  () => ({
    GraphWidgetBarChartRenderer: () => mockBarChartRenderer(),
  }),
);

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const createdAtFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'createdAt',
});

const REQUIRED_DATE_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Period',
  filterType: 'DATE_TIME',
  isRequired: true,
};

const renderGraphWidget = ({
  dashboardFilterValues = {},
  hasInitializedDashboardFilterValues = true,
}: {
  dashboardFilterValues?: DashboardFilterValues;
  hasInitializedDashboardFilterValues?: boolean;
}) => {
  const widget = buildChartWidget({
    id: GRAPH_WIDGET_TEST_INSTANCE_ID,
    objectMetadataId: companyObjectMetadataItem.id,
    dashboardFilterBindings: {
      [REQUIRED_DATE_SLOT.id]: {
        fieldMetadataId: createdAtFieldMetadataItem.id,
      },
    },
  });

  const onInitializeJotaiStore = (store: Store) => {
    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        id: PAGE_LAYOUT_TEST_INSTANCE_ID,
        name: 'Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [makeTab('tab-1', [widget])],
        dashboardFilters: [REQUIRED_DATE_SLOT],
      } as unknown as PageLayout,
    );

    store.set(
      dashboardFilterValuesComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      dashboardFilterValues,
    );

    store.set(
      hasInitializedDashboardFilterValuesComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      hasInitializedDashboardFilterValues,
    );
  };

  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore,
  });

  return render(
    <I18nProvider i18n={i18n}>
      <MetadataWrapper>
        <GraphWidgetTestWrapper>
          <GraphWidget />
        </GraphWidgetTestWrapper>
      </MetadataWrapper>
    </I18nProvider>,
  );
};

describe('GraphWidget', () => {
  beforeEach(() => {
    mockBarChartRenderer.mockClear();
  });

  it('asks for the required dashboard filter instead of mounting the chart renderer', () => {
    renderGraphWidget({});

    expect(screen.getByText('Set the Period filter')).toBeVisible();
    expect(mockBarChartRenderer).not.toHaveBeenCalled();
  });

  it('mounts the chart renderer once the required dashboard filter has a value', () => {
    renderGraphWidget({
      dashboardFilterValues: {
        [REQUIRED_DATE_SLOT.id]: {
          operand: ViewFilterOperand.IS_TODAY,
          value: '',
        },
      },
    });

    expect(screen.getByTestId('bar-chart-renderer')).toBeInTheDocument();
    expect(screen.queryByText('Set the Period filter')).not.toBeInTheDocument();
  });

  it('shows a skeleton and mounts nothing else until the dashboard filter values are seeded', () => {
    const { container } = renderGraphWidget({
      hasInitializedDashboardFilterValues: false,
      dashboardFilterValues: {
        [REQUIRED_DATE_SLOT.id]: {
          operand: ViewFilterOperand.IS_TODAY,
          value: '',
        },
      },
    });

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(mockBarChartRenderer).not.toHaveBeenCalled();
    expect(screen.queryByText('Set the Period filter')).not.toBeInTheDocument();
  });
});
