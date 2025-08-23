import { type Meta, type StoryObj } from '@storybook/react';

import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';
import { GraphWidgetBarChart } from '../GraphWidgetBarChart';

const meta: Meta<typeof GraphWidgetBarChart> = {
  title: 'Modules/Dashboards/Graphs/GraphWidgetBarChart',
  component: GraphWidgetBarChart,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    data: {
      control: 'object',
    },
    indexBy: {
      control: 'text',
    },
    keys: {
      control: 'object',
    },
    displayType: {
      control: 'select',
      options: ['percentage', 'number', 'shortNumber', 'currency', 'custom'],
    },
    prefix: {
      control: 'text',
    },
    suffix: {
      control: 'text',
    },
    decimals: {
      control: 'number',
    },
    showLegend: {
      control: 'boolean',
    },
    showGrid: {
      control: 'boolean',
    },
    showValues: {
      control: 'boolean',
    },
    xAxisLabel: {
      control: 'text',
    },
    yAxisLabel: {
      control: 'text',
    },
    tooltipHref: {
      control: 'text',
    },
    id: {
      control: 'text',
    },
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    groupMode: {
      control: 'select',
      options: ['grouped', 'stacked'],
    },
    seriesLabels: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GraphWidgetBarChart>;

const Container = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '500px', height: '300px' }}>{children}</div>
);

export const Default: Story = {
  args: {
    data: [
      { month: 'Jan', sales: 120, leads: 45, conversions: 12 },
      { month: 'Feb', sales: 150, leads: 52, conversions: 15 },
      { month: 'Mar', sales: 180, leads: 48, conversions: 18 },
      { month: 'Apr', sales: 140, leads: 60, conversions: 14 },
      { month: 'May', sales: 200, leads: 55, conversions: 20 },
    ],
    indexBy: 'month',
    keys: ['sales', 'leads', 'conversions'],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Count',
    tooltipHref: 'https://example.com/metrics',
    id: 'bar-chart-default',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const Revenue: Story = {
  args: {
    data: [
      { quarter: 'Q1', revenue: 420000, costs: 280000, profit: 140000 },
      { quarter: 'Q2', revenue: 480000, costs: 320000, profit: 160000 },
      { quarter: 'Q3', revenue: 520000, costs: 340000, profit: 180000 },
      { quarter: 'Q4', revenue: 580000, costs: 360000, profit: 220000 },
    ],
    indexBy: 'quarter',
    keys: ['revenue', 'costs', 'profit'],
    seriesLabels: {
      revenue: 'Total Revenue',
      costs: 'Operating Costs',
      profit: 'Net Profit',
    },
    displayType: 'shortNumber',
    prefix: '$',
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Quarter',
    yAxisLabel: 'Amount ($)',
    tooltipHref: 'https://example.com/financials',
    id: 'bar-chart-revenue',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const Stacked: Story = {
  args: {
    data: [
      { category: 'Website', desktop: 65, mobile: 35, tablet: 15 },
      { category: 'App', desktop: 25, mobile: 85, tablet: 30 },
      { category: 'Email', desktop: 45, mobile: 40, tablet: 20 },
      { category: 'Social', desktop: 30, mobile: 75, tablet: 25 },
    ],
    indexBy: 'category',
    keys: ['desktop', 'mobile', 'tablet'],
    seriesLabels: {
      desktop: 'Desktop',
      mobile: 'Mobile',
      tablet: 'Tablet',
    },
    groupMode: 'stacked',
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Channel',
    yAxisLabel: 'Users',
    tooltipHref: 'https://example.com/analytics',
    id: 'bar-chart-stacked',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const Horizontal: Story = {
  args: {
    data: [
      { product: 'Product A', score: 85 },
      { product: 'Product B', score: 72 },
      { product: 'Product C', score: 90 },
      { product: 'Product D', score: 65 },
      { product: 'Product E', score: 78 },
    ],
    indexBy: 'product',
    keys: ['score'],
    layout: 'horizontal',
    showLegend: false,
    showGrid: true,
    xAxisLabel: 'Score',
    yAxisLabel: 'Product',
    suffix: '%',
    tooltipHref: 'https://example.com/products',
    id: 'bar-chart-horizontal',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const WithValues: Story = {
  args: {
    data: [
      { team: 'Sales', performance: 92, target: 100 },
      { team: 'Marketing', performance: 78, target: 85 },
      { team: 'Support', performance: 88, target: 90 },
      { team: 'Development', performance: 95, target: 95 },
    ],
    indexBy: 'team',
    keys: ['performance', 'target'],
    seriesLabels: {
      performance: 'Actual',
      target: 'Target',
    },
    showValues: true,
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Team',
    yAxisLabel: 'Score',
    suffix: '%',
    tooltipHref: 'https://example.com/teams',
    id: 'bar-chart-with-values',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const SingleSeries: Story = {
  args: {
    data: [
      { day: 'Mon', visitors: 1200 },
      { day: 'Tue', visitors: 1450 },
      { day: 'Wed', visitors: 1800 },
      { day: 'Thu', visitors: 1650 },
      { day: 'Fri', visitors: 2000 },
      { day: 'Sat', visitors: 1100 },
      { day: 'Sun', visitors: 900 },
    ],
    indexBy: 'day',
    keys: ['visitors'],
    showLegend: false,
    showGrid: true,
    xAxisLabel: 'Day of Week',
    yAxisLabel: 'Visitors',
    displayType: 'shortNumber',
    tooltipHref: 'https://example.com/traffic',
    id: 'bar-chart-single',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const Currency: Story = {
  args: {
    data: [
      { region: 'North', sales: 45000.5, budget: 50000 },
      { region: 'South', sales: 38000.75, budget: 40000 },
      { region: 'East', sales: 52000.25, budget: 48000 },
      { region: 'West', sales: 41000, budget: 45000 },
    ],
    indexBy: 'region',
    keys: ['sales', 'budget'],
    seriesLabels: {
      sales: 'Actual Sales',
      budget: 'Budget',
    },
    displayType: 'currency',
    decimals: 2,
    prefix: '$',
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Region',
    yAxisLabel: 'Amount',
    tooltipHref: 'https://example.com/regional-sales',
    id: 'bar-chart-currency',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const Negative: Story = {
  args: {
    data: [
      { month: 'Jan', profit: 5000, loss: -3000 },
      { month: 'Feb', profit: 7000, loss: -2000 },
      { month: 'Mar', profit: 3000, loss: -4500 },
      { month: 'Apr', profit: 8000, loss: -1500 },
      { month: 'May', profit: 6000, loss: -2500 },
    ],
    indexBy: 'month',
    keys: ['profit', 'loss'],
    seriesLabels: {
      profit: 'Profit',
      loss: 'Loss',
    },
    displayType: 'currency',
    prefix: '$',
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Amount ($)',
    tooltipHref: 'https://example.com/profit-loss',
    id: 'bar-chart-negative',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const Catalog: Story = {
  decorators: [CatalogDecorator],
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'series',
          values: [1, 2, 3],
          props: (seriesCount: number) => {
            const baseData = [
              { category: 'A', series1: 30, series2: 45, series3: 20 },
              { category: 'B', series1: 40, series2: 35, series3: 25 },
              { category: 'C', series1: 25, series2: 50, series3: 30 },
            ];

            const keys = Array.from(
              { length: seriesCount },
              (_, i) => `series${i + 1}`,
            );

            return {
              data: baseData,
              keys,
              id: `bar-chart-catalog-${seriesCount}`,
            };
          },
          labels: (seriesCount: number) => `${seriesCount} series`,
        },
        {
          name: 'groupMode',
          values: ['grouped', 'stacked'],
          props: (mode: string) => ({
            groupMode: mode as 'grouped' | 'stacked',
          }),
        },
      ],
    },
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy="category"
        keys={args.keys}
        groupMode={args.groupMode}
        showLegend={true}
        showGrid={true}
        id={args.id}
      />
    </Container>
  ),
};
