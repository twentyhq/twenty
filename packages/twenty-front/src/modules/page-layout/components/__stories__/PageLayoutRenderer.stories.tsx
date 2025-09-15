import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { GraphType, WidgetType } from '@/page-layout/mocks/mockWidgets';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { RecoilRoot } from 'recoil';
import { PageLayoutType } from '~/generated/graphql';
import { type PageLayoutWidgetWithData } from '../../types/pageLayoutTypes';

const validatePageLayoutContent = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);

  await waitFor(async () => {
    const revenueElements = canvas.getAllByText('Revenue');
    expect(revenueElements).toHaveLength(2);

    const goalProgressElements = canvas.getAllByText('Goal Progress');
    expect(goalProgressElements).toHaveLength(2);

    expect(canvas.getByText('Product Sales')).toBeInTheDocument();
    expect(canvas.getByText('Services')).toBeInTheDocument();
    expect(canvas.getByText('Support')).toBeInTheDocument();
  });

  await expect(await canvas.findByText('Revenue Sources')).toBeVisible();
  await expect(await canvas.findByText('Quarterly Comparison')).toBeVisible();
  await expect(await canvas.findByText('$125,000')).toBeVisible();
};

const mixedGraphsPageLayout = {
  id: 'mixed-graphs-layout',
  name: 'Mixed Graph Dashboard',
  type: PageLayoutType.DASHBOARD,
  objectMetadataId: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
  tabs: [
    {
      id: 'mixed-tab',
      title: 'Mixed Graphs',
      position: 0,
      pageLayoutId: 'mixed-graphs-layout',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      widgets: [
        {
          id: 'number-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Revenue',
          objectMetadataId: null,
          gridPosition: {
            row: 0,
            column: 0,
            rowSpan: 2,
            columnSpan: 3,
          },
          configuration: {
            graphType: GraphType.NUMBER,
          },
          data: {
            value: '$125,000',
            trendPercentage: 8.3,
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } as PageLayoutWidgetWithData,
        {
          id: 'gauge-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Goal Progress',
          objectMetadataId: null,
          gridPosition: {
            row: 0,
            column: 3,
            rowSpan: 4,
            columnSpan: 3,
          },
          configuration: {
            graphType: GraphType.GAUGE,
          },
          data: {
            value: 0.75,
            min: 0,
            max: 1,
            label: 'Goal Progress',
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } as PageLayoutWidgetWithData,
        {
          id: 'pie-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Revenue Sources',
          objectMetadataId: null,
          gridPosition: {
            row: 0,
            column: 6,
            rowSpan: 4,
            columnSpan: 3,
          },
          configuration: {
            graphType: GraphType.PIE,
          },
          data: {
            items: [
              { id: 'product', value: 60, label: 'Product Sales' },
              { id: 'services', value: 30, label: 'Services' },
              { id: 'support', value: 10, label: 'Support' },
            ],
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } as PageLayoutWidgetWithData,
        {
          id: 'bar-widget',
          pageLayoutTabId: 'mixed-tab',
          type: WidgetType.GRAPH,
          title: 'Quarterly Comparison',
          objectMetadataId: null,
          gridPosition: {
            row: 2,
            column: 0,
            rowSpan: 4,
            columnSpan: 6,
          },
          configuration: {
            graphType: GraphType.BAR,
          },
          data: {
            items: [
              { quarter: 'Q1', revenue: 100000, expenses: 80000 },
              { quarter: 'Q2', revenue: 125000, expenses: 90000 },
              { quarter: 'Q3', revenue: 150000, expenses: 95000 },
              { quarter: 'Q4', revenue: 180000, expenses: 100000 },
            ],
            indexBy: 'quarter',
            keys: ['revenue', 'expenses'],
            layout: 'vertical',
            seriesLabels: {
              revenue: 'Revenue',
              expenses: 'Expenses',
            },
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        } as PageLayoutWidgetWithData,
      ],
    },
  ],
};

const meta: Meta<typeof PageLayoutRenderer> = {
  title: 'Modules/PageLayout/PageLayoutRenderer',
  component: PageLayoutRenderer,
  decorators: [
    (Story, { args }: { args: any }) => (
      <MemoryRouter>
        <RecoilRoot
          initializeState={({ set }) => {
            set(
              activeTabIdComponentState.atomFamily({
                instanceId: 'page-layout-stories',
              }),
              args.activeTabId,
            );
          }}
        >
          <TabListComponentInstanceContext.Provider
            value={{ instanceId: 'page-layout-stories' }}
          >
            <Story />
          </TabListComponentInstanceContext.Provider>
        </RecoilRoot>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    pageLayout: mixedGraphsPageLayout,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const DesktopView: Story = {
  args: {
    activeTabId: 'mixed-tab',
  },
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
  args: {
    activeTabId: 'mixed-tab',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    await validatePageLayoutContent(canvasElement);
  },
};
