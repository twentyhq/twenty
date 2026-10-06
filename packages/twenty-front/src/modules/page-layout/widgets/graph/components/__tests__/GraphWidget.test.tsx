import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
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
import { FeatureFlagKey, PageLayoutType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
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
  isDashboardFiltersEnabled = true,
  dashboardFilterValues = {},
}: {
  isDashboardFiltersEnabled?: boolean;
  dashboardFilterValues?: DashboardFilterValues;
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

  it('never blocks the chart when the feature flag is off', () => {
    renderGraphWidget({ isDashboardFiltersEnabled: false });

    expect(screen.getByTestId('bar-chart-renderer')).toBeInTheDocument();
  });
});
