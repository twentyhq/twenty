import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { FIND_ONE_PAGE_LAYOUT } from '@/dashboards/graphql/queries/findOnePageLayout';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { RecoilRoot } from 'recoil';
import {
  GraphOrderBy,
  GraphType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  ExtendedAggregateOperations,
  PageLayoutType,
  type PageLayoutWidget,
} from '~/generated/graphql';

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
  objectMetadataId: null,
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
          objectMetadataId: null,
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
          objectMetadataId: null,
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
          objectMetadataId: null,
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
          objectMetadataId: null,
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
            aggregateFieldMetadataId: 'id',
            groupByFieldMetadataIdX: 'createdAt',
            orderByX: GraphOrderBy.FIELD_ASC,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } as PageLayoutWidget,
      ],
    },
  ],
};

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
];

const meta: Meta<typeof PageLayoutRenderer> = {
  title: 'Modules/PageLayout/PageLayoutRenderer',
  component: PageLayoutRenderer,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <MockedProvider mocks={graphqlMocks} addTypename={false}>
          <RecoilRoot>
            <Story />
          </RecoilRoot>
        </MockedProvider>
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
