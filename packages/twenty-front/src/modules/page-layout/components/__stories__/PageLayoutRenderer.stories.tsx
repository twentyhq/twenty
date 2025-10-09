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
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { generateGroupByQuery } from '@/page-layout/widgets/graph/utils/generateGroupByQuery';
import {
  GraphOrderBy,
  GraphType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  AxisNameDisplay,
  type BarChartConfiguration,
  ExtendedAggregateOperations,
  PageLayoutType,
  type PageLayoutWidget,
} from '~/generated/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockPersonObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

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
  objectMetadataId: mockPersonObjectMetadataItem.id,
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
            __typename: 'NumberChartConfiguration',
            graphType: GraphType.NUMBER,
            aggregateOperation: ExtendedAggregateOperations.COUNT,
            aggregateFieldMetadataId: 'id',
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } as PageLayoutWidget,
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
            graphType: GraphType.GAUGE,
            aggregateOperation: ExtendedAggregateOperations.COUNT,
            aggregateFieldMetadataId: 'id',
            displayDataLabel: false,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } as PageLayoutWidget,
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
            graphType: GraphType.PIE,
            aggregateOperation: ExtendedAggregateOperations.COUNT,
            aggregateFieldMetadataId: 'id',
            groupByFieldMetadataId: 'createdAt',
            orderBy: GraphOrderBy.VALUE_DESC,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } as PageLayoutWidget,
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
            graphType: GraphType.BAR,
            aggregateOperation: ExtendedAggregateOperations.COUNT,
            aggregateFieldMetadataId: mockPersonObjectMetadataItem.fields.find(
              (field) => field.name === 'name',
            )?.id,
            groupByFieldMetadataIdX: mockPersonObjectMetadataItem.fields.find(
              (field) => field.name === 'createdAt',
            )?.id,
            orderByX: GraphOrderBy.FIELD_ASC,
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

const barChartGroupByQuery = generateGroupByQuery({
  objectMetadataItem: mockPersonObjectMetadataItem,
  aggregateOperations: ['totalCount'],
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
    (Story) => (
      <MemoryRouter>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <Story />
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
