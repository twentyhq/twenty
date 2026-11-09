import { type ApolloClient } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { type MockedResponse } from '@apollo/client/testing';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect, within } from 'storybook/test';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import {
  AggregateOperations,
  AxisNameDisplay,
  FeatureFlagKey,
  type BarChartConfiguration,
  BarChartLayout,
  FindOnePageLayoutDocument,
  GraphOrderBy,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  type PageLayoutWidget,
  WidgetConfigurationType,
  ViewFilterOperand,
  WidgetType,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const mockPersonObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const mockDashboardObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('dashboard');

const idField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: mockPersonObjectMetadataItem,
  fieldName: 'id',
});
const nameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: mockPersonObjectMetadataItem,
  fieldName: 'name',
});
const createdAtField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: mockPersonObjectMetadataItem,
  fieldName: 'createdAt',
});

const validatePageLayoutContent = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);

  await expect(await canvas.findByText('Revenue')).toBeVisible();
  await expect(await canvas.findByText('Revenue Sources')).toBeVisible();
  await expect(await canvas.findByText('Quarterly Comparison')).toBeVisible();
};

const mixedGraphsPageLayoutMocks = {
  __typename: 'PageLayout',
  id: 'mixed-graphs-layout',
  name: 'Mixed Graph Dashboard',
  type: PageLayoutType.DASHBOARD,
  objectMetadataId: mockDashboardObjectMetadataItem.id,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
  tabs: [
    {
      __typename: 'PageLayoutTab',
      isActive: true,
      id: 'mixed-tab',
      title: 'Mixed Graphs',
      position: 0,
      pageLayoutId: 'mixed-graphs-layout',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      widgets: [
        {
          __typename: 'PageLayoutWidget',
          applicationId: '',
          universalIdentifier: 'universal-identifier-mock',
          isSystemSideEffect: false,
          isActive: true,
          id: 'number-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Revenue',
          objectMetadataId: mockPersonObjectMetadataItem.id,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            __typename: 'PageLayoutWidgetGridPosition',
            row: 0,
            column: 0,
            rowSpan: 2,
            columnSpan: 3,
          },
          configuration: {
            __typename: 'AggregateChartConfiguration',
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateOperation: AggregateOperations.COUNT,
            aggregateFieldMetadataId: idField.id,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } satisfies PageLayoutWidget,
        {
          isSystemSideEffect: false,
          universalIdentifier: 'universal-identifier-mock',
          __typename: 'PageLayoutWidget',
          applicationId: '',
          isActive: true,
          id: 'pie-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Revenue Sources',
          objectMetadataId: mockPersonObjectMetadataItem.id,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            __typename: 'PageLayoutWidgetGridPosition',
            row: 0,
            column: 6,
            rowSpan: 4,
            columnSpan: 3,
          },
          configuration: {
            __typename: 'PieChartConfiguration',
            configurationType: WidgetConfigurationType.PIE_CHART,
            aggregateOperation: AggregateOperations.COUNT,
            aggregateFieldMetadataId: idField.id,
            groupByFieldMetadataId: createdAtField.id,
            orderBy: GraphOrderBy.VALUE_DESC,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } satisfies PageLayoutWidget,
        {
          isSystemSideEffect: false,
          universalIdentifier: 'universal-identifier-mock',
          __typename: 'PageLayoutWidget',
          applicationId: '',
          isActive: true,
          id: 'bar-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Quarterly Comparison',
          objectMetadataId: mockPersonObjectMetadataItem.id,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            __typename: 'PageLayoutWidgetGridPosition',
            row: 2,
            column: 0,
            rowSpan: 4,
            columnSpan: 6,
          },
          configuration: {
            __typename: 'BarChartConfiguration',
            configurationType: WidgetConfigurationType.BAR_CHART,
            layout: BarChartLayout.VERTICAL,
            aggregateOperation: AggregateOperations.COUNT,
            aggregateFieldMetadataId: nameField.id,
            primaryAxisGroupByFieldMetadataId: createdAtField.id,
            primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
            axisNameDisplay: AxisNameDisplay.BOTH,
            displayDataLabel: false,
          } satisfies BarChartConfiguration,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } as PageLayoutWidget,
      ],
    },
  ],
};

const PHONE_TABS_PAGE_LAYOUT_ID = 'phone-tabs-layout';

const phoneTabsPageLayoutMocks = {
  ...mixedGraphsPageLayoutMocks,
  id: PHONE_TABS_PAGE_LAYOUT_ID,
  filters: [
    {
      __typename: 'PageLayoutFilter',
      ...DASHBOARD_DATE_RANGE_FILTER,
      defaultValue: {
        __typename: 'PageLayoutFilterValue',
        conditions: [
          {
            __typename: 'PageLayoutFilterCondition',
            operand: ViewFilterOperand.IS_AFTER,
            value: '2025-12-01',
          },
          {
            __typename: 'PageLayoutFilterCondition',
            operand: ViewFilterOperand.IS_BEFORE,
            value: '2026-03-29',
          },
        ],
      },
    },
  ],
  tabs: ['Overview', 'Details', 'Pipeline', 'Forecasts', 'Activity'].map(
    (title, position) => ({
      ...mixedGraphsPageLayoutMocks.tabs[0],
      id: `phone-tab-${position}`,
      title,
      position,
      pageLayoutId: PHONE_TABS_PAGE_LAYOUT_ID,
      widgets: [],
    }),
  ),
};

const barChartGroupByQuery = generateGroupByAggregateQuery({
  objectMetadataItem: mockPersonObjectMetadataItem,
  aggregateOperationGqlFields: ['totalCount'],
});

const graphqlMocks: MockedResponse[] = [
  {
    request: {
      query: FindOnePageLayoutDocument,
      variables: { id: PHONE_TABS_PAGE_LAYOUT_ID },
    },
    result: { data: { getPageLayout: phoneTabsPageLayoutMocks } },
  },
  {
    request: {
      query: FindOnePageLayoutDocument,
      variables: {
        id: 'mixed-graphs-layout',
      },
    },
    result: {
      data: {
        getPageLayout: mixedGraphsPageLayoutMocks,
      },
    },
  },
  {
    request: {
      query: barChartGroupByQuery,
      variables: {
        groupBy: [
          {
            createdAt: {
              granularity: 'DAY',
            },
          },
        ],
      },
    },
    result: {
      data: {
        peopleGroupBy: [
          {
            groupByDimensionValues: ['2024-01-15T00:00:00.000Z'],
            totalCount: 12,
          },
          {
            groupByDimensionValues: ['2024-02-15T00:00:00.000Z'],
            totalCount: 18,
          },
          {
            groupByDimensionValues: ['2024-03-15T00:00:00.000Z'],
            totalCount: 25,
          },
          {
            groupByDimensionValues: ['2024-04-15T00:00:00.000Z'],
            totalCount: 15,
          },
          {
            groupByDimensionValues: ['2024-05-15T00:00:00.000Z'],
            totalCount: 22,
          },
          {
            groupByDimensionValues: ['2024-06-15T00:00:00.000Z'],
            totalCount: 30,
          },
        ],
      },
    },
  },
];

const CoreClientProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloClient = useApolloClient() as ApolloClient;

  return (
    <ApolloCoreClientContext.Provider value={apolloClient}>
      {children}
    </ApolloCoreClientContext.Provider>
  );
};

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: graphqlMocks,
});

const meta: Meta<typeof PageLayoutRenderer> = {
  title: 'Modules/PageLayout/PageLayoutRenderer',
  component: PageLayoutRenderer,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <LayoutRenderingProvider
              value={{
                layoutType: PageLayoutType.DASHBOARD,
                targetRecordIdentifier: {
                  targetObjectNameSingular:
                    StandardObjectNameSingular.Dashboard,
                  id: mixedGraphsPageLayoutMocks.id,
                },
              }}
            >
              <Story />
            </LayoutRenderingProvider>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    pageLayoutId: mixedGraphsPageLayoutMocks.id,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const DesktopView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop1',
    },
  },
  play: async ({ canvasElement }) => {
    await validatePageLayoutContent(canvasElement);
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    await validatePageLayoutContent(canvasElement);
  },
};

// iPhone 13; story viewport parameters do not resize the vitest browser, and useIsMobile reads the window
const PHONE_VIEWPORT = { width: 390, height: 844 };

const setUpPhoneDashboard = async () => {
  const { page } = await import('vitest/browser');
  const previousViewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  await page.viewport(PHONE_VIEWPORT.width, PHONE_VIEWPORT.height);
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      { key: FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED, value: true },
    ],
  });

  return async () => {
    await page.viewport(previousViewport.width, previousViewport.height);
  };
};

export const KeepsTheFirstTabVisibleOnAPhone: Story = {
  args: { pageLayoutId: PHONE_TABS_PAGE_LAYOUT_ID },
  beforeEach: setUpPhoneDashboard,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Loading a dashboard sets its edit mode, so enter it afterwards
    await canvas.findByText('Add Widget');
    jotaiStore.set(
      isDashboardInEditModeComponentState.atomFamily({
        instanceId: PHONE_TABS_PAGE_LAYOUT_ID,
      }),
      true,
    );
    const control = await canvas.findByRole('button', {
      name: /^Date range: Dec 1, 2025/,
    });

    const firstTab = await canvas.findByText('Overview');
    const tabRow = firstTab.closest('.page-layout-tab-list-print-hidden');

    expect(tabRow).not.toBeNull();
    expect(tabRow?.scrollLeft).toBe(0);
    expect(firstTab.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      tabRow?.getBoundingClientRect().left ?? 0,
    );
    expect(control.getBoundingClientRect().right).toBeLessThanOrEqual(
      window.innerWidth,
    );

    // The tab list absorbs the overflow, so the row around it and the bar never scrolls
    const rowAroundTabsAndBar = control.closest(
      '.page-layout-tab-list-print-hidden',
    );

    expect(rowAroundTabsAndBar?.scrollWidth).toBe(
      rowAroundTabsAndBar?.clientWidth,
    );
  },
};
