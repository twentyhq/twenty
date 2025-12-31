import {
  type ApolloClient,
  type NormalizedCacheObject,
  useApolloClient,
} from '@apollo/client';
import { type MockedResponse } from '@apollo/client/testing';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { FIND_ONE_PAGE_LAYOUT } from '@/dashboards/graphql/queries/findOnePageLayout';
import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { GraphOrderBy, WidgetType } from '~/generated-metadata/graphql';
import {
  AggregateOperations,
  AxisNameDisplay,
  type BarChartConfiguration,
  BarChartLayout,
  PageLayoutType,
  type PageLayoutWidget,
  WidgetConfigurationType,
} from '~/generated/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

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
  await expect(await canvas.findByText('Goal Progress')).toBeVisible();
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
          id: 'number-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Revenue',
          objectMetadataId: mockPersonObjectMetadataItem.id,
          gridPosition: {
            __typename: 'GridPosition',
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
          __typename: 'PageLayoutWidget',
          id: 'gauge-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Goal Progress',
          objectMetadataId: mockPersonObjectMetadataItem.id,
          gridPosition: {
            __typename: 'GridPosition',
            row: 0,
            column: 3,
            rowSpan: 4,
            columnSpan: 3,
          },
          configuration: {
            __typename: 'GaugeChartConfiguration',
            configurationType: WidgetConfigurationType.GAUGE_CHART,
            aggregateOperation: AggregateOperations.COUNT,
            aggregateFieldMetadataId: idField.id,
            displayDataLabel: false,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } satisfies PageLayoutWidget,
        {
          __typename: 'PageLayoutWidget',
          id: 'pie-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Revenue Sources',
          objectMetadataId: mockPersonObjectMetadataItem.id,
          gridPosition: {
            __typename: 'GridPosition',
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
          __typename: 'PageLayoutWidget',
          id: 'bar-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Quarterly Comparison',
          objectMetadataId: mockPersonObjectMetadataItem.id,
          gridPosition: {
            __typename: 'GridPosition',
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

const barChartGroupByQuery = generateGroupByAggregateQuery({
  objectMetadataItem: mockPersonObjectMetadataItem,
  aggregateOperationGqlFields: ['totalCount'],
});

const graphqlMocks: MockedResponse[] = [
  {
    request: {
      query: FIND_ONE_PAGE_LAYOUT,
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
  const apolloClient = useApolloClient() as ApolloClient<NormalizedCacheObject>;

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
    I18nFrontDecorator,
    (Story) => (
      <MemoryRouter>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <LayoutRenderingProvider
              value={{
                isInRightDrawer: false,
                layoutType: PageLayoutType.DASHBOARD,
                targetRecordIdentifier: {
                  targetObjectNameSingular: CoreObjectNameSingular.Dashboard,
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
