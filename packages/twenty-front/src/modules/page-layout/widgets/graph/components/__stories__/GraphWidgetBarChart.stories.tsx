import { type Meta, type StoryObj } from '@storybook/react';

import { GraphWidgetTestWrapper } from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { GraphWidgetBarChart } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChart';
import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';
import { BarChartLayout } from '~/generated/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const meta: Meta<typeof GraphWidgetBarChart> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetBarChart',
  component: GraphWidgetBarChart,
  decorators: [
    I18nFrontDecorator,
    (Story) => (
      <GraphWidgetTestWrapper>
        <Story />
      </GraphWidgetTestWrapper>
    ),
    ComponentDecorator,
  ],
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
    series: {
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
      {
        month: 'Jan',
        sales: 120,
        leads: 45,
        conversions: 12,
        to: '/metrics/january',
      },
      {
        month: 'Feb',
        sales: 150,
        leads: 52,
        conversions: 15,
        to: '/metrics/february',
      },
      {
        month: 'Mar',
        sales: 180,
        leads: 48,
        conversions: 18,
        to: '/metrics/march',
      },
      {
        month: 'Apr',
        sales: 140,
        leads: 60,
        conversions: 14,
        to: '/metrics/april',
      },
      {
        month: 'May',
        sales: 200,
        leads: 55,
        conversions: 20,
        to: '/metrics/may',
      },
    ],
    indexBy: 'month',
    keys: ['sales', 'leads', 'conversions'],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Count',
    id: 'bar-chart-default',
    groupMode: 'stacked',
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
        id={args.id}
        groupMode={args.groupMode}
      />
    </Container>
  ),
};

export const Revenue: Story = {
  args: {
    data: [
      {
        quarter: 'Q1',
        revenue: 420000,
        costs: 280000,
        profit: 140000,
        to: '/financials/q1',
      },
      {
        quarter: 'Q2',
        revenue: 480000,
        costs: 320000,
        profit: 160000,
        to: '/financials/q2',
      },
      {
        quarter: 'Q3',
        revenue: 520000,
        costs: 340000,
        profit: 180000,
        to: '/financials/q3',
      },
      {
        quarter: 'Q4',
        revenue: 580000,
        costs: 360000,
        profit: 220000,
        to: '/financials/q4',
      },
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
    id: 'bar-chart-revenue',
    groupMode: 'stacked',
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
        id={args.id}
        groupMode={args.groupMode}
      />
    </Container>
  ),
};

export const Grouped: Story = {
  args: {
    data: [
      {
        category: 'Website',
        desktop: 65,
        mobile: 35,
        tablet: 15,
        to: '/analytics/website',
      },
      {
        category: 'App',
        desktop: 25,
        mobile: 85,
        tablet: 30,
        to: '/analytics/app',
      },
      {
        category: 'Email',
        desktop: 45,
        mobile: 40,
        tablet: 20,
        to: '/analytics/email',
      },
      {
        category: 'Social',
        desktop: 30,
        mobile: 75,
        tablet: 25,
        to: '/analytics/social',
      },
    ],
    indexBy: 'category',
    keys: ['desktop', 'mobile', 'tablet'],
    seriesLabels: {
      desktop: 'Desktop',
      mobile: 'Mobile',
      tablet: 'Tablet',
    },
    groupMode: 'grouped',
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Channel',
    yAxisLabel: 'Users',
    id: 'bar-chart-stacked',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        groupMode={args.groupMode}
        seriesLabels={args.seriesLabels}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        id={args.id}
      />
    </Container>
  ),
};

export const Horizontal: Story = {
  args: {
    data: [
      { product: 'Product A', score: 85, to: '/products/a' },
      { product: 'Product B', score: 72, to: '/products/b' },
      { product: 'Product C', score: 90, to: '/products/c' },
      { product: 'Product D', score: 65, to: '/products/d' },
      { product: 'Product E', score: 78, to: '/products/e' },
    ],
    indexBy: 'product',
    keys: ['score'],
    layout: BarChartLayout.HORIZONTAL,
    showLegend: false,
    showGrid: true,
    xAxisLabel: 'Score',
    yAxisLabel: 'Product',
    suffix: '%',
    id: 'bar-chart-horizontal',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        layout={args.layout}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        suffix={args.suffix}
        id={args.id}
      />
    </Container>
  ),
};

export const WithValues: Story = {
  args: {
    data: [
      { team: 'Sales', performance: 92, target: 100, to: '/teams/sales' },
      {
        team: 'Marketing',
        performance: 78,
        target: 85,
        to: '/teams/marketing',
      },
      { team: 'Support', performance: 88, target: 90, to: '/teams/support' },
      {
        team: 'Development',
        performance: 95,
        target: 95,
        to: '/teams/development',
      },
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
    id: 'bar-chart-with-values',
    groupMode: 'stacked',
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
        id={args.id}
        groupMode={args.groupMode}
      />
    </Container>
  ),
};

export const WithCustomColors: Story = {
  args: {
    data: [
      {
        month: 'Jan',
        sales: 120,
        leads: 45,
        conversions: 12,
        to: '/reports/jan',
      },
      {
        month: 'Feb',
        sales: 150,
        leads: 52,
        conversions: 15,
        to: '/reports/feb',
      },
      {
        month: 'Mar',
        sales: 180,
        leads: 48,
        conversions: 18,
        to: '/reports/mar',
      },
      {
        month: 'Apr',
        sales: 140,
        leads: 60,
        conversions: 14,
        to: '/reports/apr',
      },
      {
        month: 'May',
        sales: 200,
        leads: 55,
        conversions: 20,
        to: '/reports/may',
      },
    ],
    indexBy: 'month',
    keys: ['sales', 'leads', 'conversions'],
    series: [
      { key: 'sales', label: 'Total Sales', color: 'orange' },
      { key: 'leads', label: 'New Leads', color: 'turquoise' },
      { key: 'conversions', label: 'Conversions', color: 'pink' },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Count',
    groupMode: 'stacked',
    id: 'bar-chart-custom-colors',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        series={args.series}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        id={args.id}
        groupMode={args.groupMode}
      />
    </Container>
  ),
};

export const SingleSeries: Story = {
  args: {
    data: [
      { day: 'Mon', visitors: 1200, to: '/traffic/monday' },
      { day: 'Tue', visitors: 1450, to: '/traffic/tuesday' },
      { day: 'Wed', visitors: 1800, to: '/traffic/wednesday' },
      { day: 'Thu', visitors: 1650, to: '/traffic/thursday' },
      { day: 'Fri', visitors: 2000, to: '/traffic/friday' },
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
        id={args.id}
      />
    </Container>
  ),
};

export const Currency: Story = {
  args: {
    data: [
      { region: 'North', sales: 45000.5, budget: 50000, to: '/regions/north' },
      { region: 'South', sales: 38000.75, budget: 40000, to: '/regions/south' },
      { region: 'East', sales: 52000.25, budget: 48000, to: '/regions/east' },
      { region: 'West', sales: 41000, budget: 45000, to: '/regions/west' },
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
    id: 'bar-chart-currency',
    groupMode: 'grouped',
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
        id={args.id}
        groupMode={args.groupMode}
      />
    </Container>
  ),
};

export const NegativeValues: Story = {
  args: {
    data: [
      { quarter: 'Q1', profit: -50000, to: '/financials/q1' },
      { quarter: 'Q2', profit: -20000, to: '/financials/q2' },
      { quarter: 'Q3', profit: 10000, to: '/financials/q3' },
      { quarter: 'Q4', profit: 80000, to: '/financials/q4' },
    ],
    indexBy: 'quarter',
    keys: ['profit'],
    seriesLabels: {
      profit: 'Net Profit',
    },
    displayType: 'shortNumber',
    prefix: '$',
    showLegend: false,
    showGrid: true,
    xAxisLabel: 'Quarter',
    yAxisLabel: 'Profit/Loss ($)',
    id: 'bar-chart-negative',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        seriesLabels={args.seriesLabels}
        displayType={args.displayType}
        prefix={args.prefix}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        id={args.id}
      />
    </Container>
  ),
};

export const MixedPositiveNegative: Story = {
  args: {
    data: [
      {
        month: 'Jan',
        revenue: 120000,
        expenses: -80000,
        net: 40000,
        to: '/reports/jan',
      },
      {
        month: 'Feb',
        revenue: 150000,
        expenses: -95000,
        net: 55000,
        to: '/reports/feb',
      },
      {
        month: 'Mar',
        revenue: 130000,
        expenses: -140000,
        net: -10000,
        to: '/reports/mar',
      },
      {
        month: 'Apr',
        revenue: 180000,
        expenses: -110000,
        net: 70000,
        to: '/reports/apr',
      },
    ],
    indexBy: 'month',
    keys: ['revenue', 'expenses', 'net'],
    seriesLabels: {
      revenue: 'Revenue',
      expenses: 'Expenses',
      net: 'Net Income',
    },
    displayType: 'shortNumber',
    prefix: '$',
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Amount ($)',
    id: 'bar-chart-mixed-values',
    groupMode: 'grouped',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        seriesLabels={args.seriesLabels}
        displayType={args.displayType}
        prefix={args.prefix}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        groupMode={args.groupMode}
        id={args.id}
      />
    </Container>
  ),
};

export const AllNegative: Story = {
  args: {
    data: [
      { category: 'Loss A', value: -45, to: '/losses/a' },
      { category: 'Loss B', value: -30, to: '/losses/b' },
      { category: 'Loss C', value: -60, to: '/losses/c' },
      { category: 'Loss D', value: -25, to: '/losses/d' },
    ],
    indexBy: 'category',
    keys: ['value'],
    showLegend: false,
    showGrid: true,
    xAxisLabel: 'Category',
    yAxisLabel: 'Value',
    id: 'bar-chart-all-negative',
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
        id={args.id}
      />
    </Container>
  ),
};

export const TemperatureData: Story = {
  args: {
    data: [
      { month: 'Jan', temperature: -5, to: '/weather/jan' },
      { month: 'Feb', temperature: -2, to: '/weather/feb' },
      { month: 'Mar', temperature: 5, to: '/weather/mar' },
      { month: 'Apr', temperature: 15, to: '/weather/apr' },
      { month: 'May', temperature: 22, to: '/weather/may' },
      { month: 'Jun', temperature: 28, to: '/weather/jun' },
    ],
    indexBy: 'month',
    keys: ['temperature'],
    showLegend: false,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Temperature',
    suffix: '°C',
    id: 'bar-chart-temperature',
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
        suffix={args.suffix}
        id={args.id}
      />
    </Container>
  ),
};

export const StackedNegative: Story = {
  args: {
    data: [
      {
        period: 'Q1',
        profit: 50000,
        loss: -30000,
        adjustment: -5000,
        to: '/periods/q1',
      },
      {
        period: 'Q2',
        profit: 70000,
        loss: -40000,
        adjustment: 10000,
        to: '/periods/q2',
      },
      {
        period: 'Q3',
        profit: 60000,
        loss: -25000,
        adjustment: -8000,
        to: '/periods/q3',
      },
      {
        period: 'Q4',
        profit: 90000,
        loss: -35000,
        adjustment: 15000,
        to: '/periods/q4',
      },
    ],
    indexBy: 'period',
    keys: ['profit', 'loss', 'adjustment'],
    seriesLabels: {
      profit: 'Profit',
      loss: 'Loss',
      adjustment: 'Adjustment',
    },
    groupMode: 'stacked',
    displayType: 'shortNumber',
    prefix: '$',
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Period',
    yAxisLabel: 'Amount ($)',
    id: 'bar-chart-stacked-negative',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        seriesLabels={args.seriesLabels}
        groupMode={args.groupMode}
        displayType={args.displayType}
        prefix={args.prefix}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        id={args.id}
      />
    </Container>
  ),
};

export const GroupedWithAllBarsTooltip: Story = {
  args: {
    data: [
      {
        period: 'January',
        lastYear: 18000,
        thisYear: 19500,
        to: '/comparison/january',
      },
      {
        period: 'February',
        lastYear: 20000,
        thisYear: 20000,
        to: '/comparison/february',
      },
      {
        period: 'March',
        lastYear: 22000,
        thisYear: 24500,
        to: '/comparison/march',
      },
      {
        period: 'April',
        lastYear: 21000,
        thisYear: 23000,
        to: '/comparison/april',
      },
    ],
    indexBy: 'period',
    keys: ['lastYear', 'thisYear'],
    seriesLabels: {
      lastYear: 'Last year',
      thisYear: 'This year',
    },
    displayType: 'shortNumber',
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Period',
    yAxisLabel: 'Revenue',
    groupMode: 'grouped',
    id: 'bar-chart-grouped-all-tooltip',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        seriesLabels={args.seriesLabels}
        displayType={args.displayType}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        groupMode={args.groupMode}
        id={args.id}
      />
    </Container>
  ),
};

export const GroupedDefaultTooltip: Story = {
  args: {
    data: [
      {
        period: 'January',
        lastYear: 18000,
        thisYear: 19500,
        to: '/comparison/january',
      },
      {
        period: 'February',
        lastYear: 20000,
        thisYear: 20000,
        to: '/comparison/february',
      },
      {
        period: 'March',
        lastYear: 22000,
        thisYear: 24500,
        to: '/comparison/march',
      },
    ],
    indexBy: 'period',
    keys: ['lastYear', 'thisYear'],
    seriesLabels: {
      lastYear: 'Last year',
      thisYear: 'This year',
    },
    displayType: 'shortNumber',
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Period',
    yAxisLabel: 'Revenue',
    groupMode: 'grouped',
    id: 'bar-chart-grouped-default',
  },
  render: (args) => (
    <Container>
      <GraphWidgetBarChart
        data={args.data}
        indexBy={args.indexBy}
        keys={args.keys}
        seriesLabels={args.seriesLabels}
        displayType={args.displayType}
        showLegend={args.showLegend}
        showGrid={args.showGrid}
        xAxisLabel={args.xAxisLabel}
        yAxisLabel={args.yAxisLabel}
        groupMode={args.groupMode}
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
        id={`bar-chart-catalog-${args.keys?.length ?? 0}-${
          args.groupMode ?? 'grouped'
        }`}
      />
    </Container>
  ),
};
