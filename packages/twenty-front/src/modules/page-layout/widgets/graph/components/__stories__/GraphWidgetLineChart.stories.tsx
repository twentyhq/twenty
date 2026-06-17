import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps } from 'react';

import { GraphWidgetTestWrapper } from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { GraphWidgetLineChart } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChart';
import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof GraphWidgetLineChart> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetLineChart',
  component: GraphWidgetLineChart,
  decorators: [
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
    enablePointLabel: {
      control: 'boolean',
    },
    groupMode: {
      control: 'select',
      options: ['stacked', undefined],
    },
    xAxisLabel: {
      control: 'text',
    },
    yAxisLabel: {
      control: 'text',
    },
    rangeMin: {
      control: 'number',
    },
    rangeMax: {
      control: 'number',
    },
    omitNullValues: {
      control: 'boolean',
    },
    colorMode: {
      control: 'select',
      options: [
        'automaticPalette',
        'explicitSingleColor',
        'selectFieldOptionColors',
      ],
    },
  },
  args: {
    colorMode: 'automaticPalette',
  },
};

export default meta;
type Story = StoryObj<typeof GraphWidgetLineChart>;
type ChartArgs = ComponentProps<typeof GraphWidgetLineChart>;

const Container = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '700px', height: '500px' }}>{children}</div>
);

const renderChart = (args: ChartArgs) => (
  <Container>
    <GraphWidgetLineChart
      id={args.id}
      data={args.data}
      showLegend={args.showLegend}
      showGrid={args.showGrid}
      enablePointLabel={args.enablePointLabel}
      groupMode={args.groupMode}
      xAxisLabel={args.xAxisLabel}
      yAxisLabel={args.yAxisLabel}
      rangeMin={args.rangeMin}
      rangeMax={args.rangeMax}
      omitNullValues={args.omitNullValues}
      displayType={args.displayType}
      prefix={args.prefix}
      suffix={args.suffix}
      decimals={args.decimals}
      colorMode={args.colorMode}
    />
  </Container>
);

const generateLinearData = (points: number = 10) => {
  return Array.from({ length: points }, (_, i) => ({
    x: i,
    y: 20 + ((i * 37 + 13) % 80),
  }));
};

export const Default: Story = {
  args: {
    id: 'line-chart-default',
    data: [
      {
        key: 'series1',
        label: 'Revenue',
        color: 'blue',
        data: generateLinearData(12),
      },
      {
        key: 'series2',
        label: 'Profit',
        color: 'turquoise',
        data: generateLinearData(12),
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Value',
    displayType: 'shortNumber',
    prefix: '$',
  },
  render: renderChart,
};

export const WithArea: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-area',
    data: [
      {
        key: 'sales',
        label: 'Sales',
        color: 'purple',
        data: generateLinearData(12),
      },
      {
        key: 'costs',
        label: 'Costs',
        color: 'orange',
        data: generateLinearData(12),
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Period',
    yAxisLabel: 'Amount',
    displayType: 'currency',
  },
};

export const StackedArea: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-stacked',
    data: [
      {
        key: 'product-a',
        label: 'Product A',
        color: 'blue',
        data: generateLinearData(8),
      },
      {
        key: 'product-b',
        label: 'Product B',
        color: 'turquoise',
        data: generateLinearData(8),
      },
      {
        key: 'product-c',
        label: 'Product C',
        color: 'purple',
        data: generateLinearData(8),
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Quarter',
    yAxisLabel: 'Revenue',
    displayType: 'shortNumber',
    prefix: '$',
    groupMode: 'stacked',
  },
};

export const StackedWithNegativeValues: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-stacked-negative',
    data: [
      {
        key: 'series-positive',
        label: 'Positive Series',
        color: 'blue',
        data: [
          { x: 'Jan', y: 10 },
          { x: 'Feb', y: -5 },
          { x: 'Mar', y: 15 },
        ],
      },
      {
        key: 'series-negative',
        label: 'Negative Series',
        color: 'red',
        data: [
          { x: 'Jan', y: 5 },
          { x: 'Feb', y: -10 },
          { x: 'Mar', y: 5 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Net Value',
    displayType: 'number',
    enablePointLabel: true,
    groupMode: 'stacked',
  },
};

export const StepChart: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-step',
    data: [
      {
        key: 'inventory',
        label: 'Inventory Level',
        color: 'orange',
        data: generateLinearData(10),
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Day',
    yAxisLabel: 'Units',
    displayType: 'number',
  },
};

export const LogScaleDemo: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-log-scale',
    data: [
      {
        key: 'exponential',
        label: 'Exponential Growth',
        color: 'purple',
        data: [
          { x: 0, y: 10 },
          { x: 1, y: 100 },
          { x: 2, y: 1000 },
          { x: 3, y: 10000 },
          { x: 4, y: 100000 },
          { x: 5, y: 1000000 },
        ],
      },
      {
        key: 'linear',
        label: 'Linear Growth',
        color: 'turquoise',
        data: [
          { x: 0, y: 50 },
          { x: 1, y: 100 },
          { x: 2, y: 150 },
          { x: 3, y: 200 },
          { x: 4, y: 250 },
          { x: 5, y: 300 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Time',
    yAxisLabel: 'Value (log scale)',
    displayType: 'shortNumber',
  },
};

export const WithNullValues: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-nulls',
    data: [
      {
        key: 'incomplete',
        label: 'With Gaps',
        color: 'blue',
        data: [
          { x: 0, y: 30 },
          { x: 1, y: 40 },
          { x: 2, y: null },
          { x: 3, y: null },
          { x: 4, y: 60 },
          { x: 5, y: 70 },
          { x: 6, y: 65 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Time',
    yAxisLabel: 'Measurement',
    displayType: 'number',
  },
};

export const MultiSeriesMixed: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-mixed',
    data: [
      {
        key: 'actual',
        label: 'Actual',
        color: 'blue',
        data: generateLinearData(12),
      },
      {
        key: 'forecast',
        label: 'Forecast',
        color: 'purple',
        data: generateLinearData(12),
      },
      {
        key: 'target',
        label: 'Target',
        color: 'orange',
        data: generateLinearData(12).map((dataPoint) => ({
          ...dataPoint,
          y: 75,
        })),
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Value',
    displayType: 'shortNumber',
  },
};

export const OverlappingGradientBlend: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-blend',
    data: [
      {
        key: 'red-series',
        label: 'Red Wave',
        color: 'red',
        data: [
          { x: 0, y: 50 },
          { x: 1, y: 70 },
          { x: 2, y: 65 },
          { x: 3, y: 80 },
          { x: 4, y: 75 },
          { x: 5, y: 90 },
          { x: 6, y: 85 },
          { x: 7, y: 95 },
        ],
      },
      {
        key: 'blue-series',
        label: 'Blue Wave',
        color: 'blue',
        data: [
          { x: 0, y: 40 },
          { x: 1, y: 60 },
          { x: 2, y: 70 },
          { x: 3, y: 75 },
          { x: 4, y: 80 },
          { x: 5, y: 70 },
          { x: 6, y: 65 },
          { x: 7, y: 60 },
        ],
      },
      {
        key: 'green-series',
        label: 'Green Wave',
        color: 'turquoise',
        data: [
          { x: 0, y: 30 },
          { x: 1, y: 45 },
          { x: 2, y: 55 },
          { x: 3, y: 60 },
          { x: 4, y: 65 },
          { x: 5, y: 60 },
          { x: 6, y: 55 },
          { x: 7, y: 50 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Time',
    yAxisLabel: 'Value',
    displayType: 'number',
  },
};

export const HighContrastOverlap: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-contrast',
    data: [
      {
        key: 'yellow-series',
        label: 'Yellow',
        color: 'yellow',
        data: [
          { x: 0, y: 60 },
          { x: 1, y: 80 },
          { x: 2, y: 85 },
          { x: 3, y: 90 },
          { x: 4, y: 85 },
          { x: 5, y: 80 },
          { x: 6, y: 75 },
        ],
      },
      {
        key: 'purple-series',
        label: 'Purple',
        color: 'purple',
        data: [
          { x: 0, y: 50 },
          { x: 1, y: 70 },
          { x: 2, y: 80 },
          { x: 3, y: 85 },
          { x: 4, y: 90 },
          { x: 5, y: 85 },
          { x: 6, y: 70 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Day',
    yAxisLabel: 'Score',
    displayType: 'number',
  },
};

export const CurveComparison: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-curves',
    data: [
      {
        key: 'dataset',
        label: 'Same Data',
        color: 'orange',
        data: [
          { x: 0, y: 20 },
          { x: 1, y: 60 },
          { x: 2, y: 40 },
          { x: 3, y: 80 },
          { x: 4, y: 30 },
          { x: 5, y: 70 },
          { x: 6, y: 50 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'X Axis',
    yAxisLabel: 'Y Axis',
    displayType: 'number',
  },
};

export const StepInterpolations: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-steps',
    data: [
      {
        key: 'step-normal',
        label: 'Step',
        color: 'blue',
        data: [
          { x: 0, y: 30 },
          { x: 1, y: 50 },
          { x: 2, y: 45 },
          { x: 3, y: 60 },
          { x: 4, y: 55 },
          { x: 5, y: 70 },
        ],
      },
      {
        key: 'step-before',
        label: 'Step Before',
        color: 'purple',
        data: [
          { x: 0, y: 25 },
          { x: 1, y: 45 },
          { x: 2, y: 40 },
          { x: 3, y: 55 },
          { x: 4, y: 50 },
          { x: 5, y: 65 },
        ],
      },
      {
        key: 'step-after',
        label: 'Step After',
        color: 'turquoise',
        data: [
          { x: 0, y: 20 },
          { x: 1, y: 40 },
          { x: 2, y: 35 },
          { x: 3, y: 50 },
          { x: 4, y: 45 },
          { x: 5, y: 60 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Time',
    yAxisLabel: 'Value',
    displayType: 'number',
  },
};

export const NaturalVsMonotone: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-smooth',
    data: [
      {
        key: 'natural',
        label: 'Natural Curve',
        color: 'pink',
        data: [
          { x: 0, y: 40 },
          { x: 1, y: 70 },
          { x: 2, y: 50 },
          { x: 3, y: 80 },
          { x: 4, y: 45 },
          { x: 5, y: 75 },
          { x: 6, y: 60 },
        ],
      },
      {
        key: 'monotone',
        label: 'Monotone X',
        color: 'orange',
        data: [
          { x: 0, y: 35 },
          { x: 1, y: 65 },
          { x: 2, y: 45 },
          { x: 3, y: 75 },
          { x: 4, y: 40 },
          { x: 5, y: 70 },
          { x: 6, y: 55 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Sample',
    yAxisLabel: 'Measurement',
    displayType: 'number',
  },
};

export const SliceTooltipDemo: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-slice-tooltip',
    data: [
      {
        key: 'revenue',
        label: 'Revenue',
        color: 'blue',
        data: [
          { x: 'Jan', y: 4500 },
          { x: 'Feb', y: 5200 },
          { x: 'Mar', y: 4800 },
          { x: 'Apr', y: 6100 },
          { x: 'May', y: 5500 },
          { x: 'Jun', y: 7200 },
        ],
      },
      {
        key: 'costs',
        label: 'Costs',
        color: 'red',
        data: [
          { x: 'Jan', y: 3200 },
          { x: 'Feb', y: 3500 },
          { x: 'Mar', y: 3100 },
          { x: 'Apr', y: 3800 },
          { x: 'May', y: 3600 },
          { x: 'Jun', y: 4200 },
        ],
      },
      {
        key: 'profit',
        label: 'Profit',
        color: 'turquoise',
        data: [
          { x: 'Jan', y: 1300 },
          { x: 'Feb', y: 1700 },
          { x: 'Mar', y: 1700 },
          { x: 'Apr', y: 2300 },
          { x: 'May', y: 1900 },
          { x: 'Jun', y: 3000 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Amount ($)',
    displayType: 'shortNumber',
    prefix: '$',
  },
};

export const PointTooltipDemo: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-point-tooltip',
    data: [
      {
        key: 'revenue',
        label: 'Revenue',
        color: 'blue',
        data: [
          { x: 'Jan', y: 4500 },
          { x: 'Feb', y: 5200 },
          { x: 'Mar', y: 4800 },
          { x: 'Apr', y: 6100 },
          { x: 'May', y: 5500 },
          { x: 'Jun', y: 7200 },
        ],
      },
      {
        key: 'costs',
        label: 'Costs',
        color: 'red',
        data: [
          { x: 'Jan', y: 3200 },
          { x: 'Feb', y: 3500 },
          { x: 'Mar', y: 3100 },
          { x: 'Apr', y: 3800 },
          { x: 'May', y: 3600 },
          { x: 'Jun', y: 4200 },
        ],
      },
      {
        key: 'profit',
        label: 'Profit',
        color: 'turquoise',
        data: [
          { x: 'Jan', y: 1300 },
          { x: 'Feb', y: 1700 },
          { x: 'Mar', y: 1700 },
          { x: 'Apr', y: 2300 },
          { x: 'May', y: 1900 },
          { x: 'Jun', y: 3000 },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    xAxisLabel: 'Month',
    yAxisLabel: 'Amount ($)',
    displayType: 'shortNumber',
    prefix: '$',
  },
};

export const Catalog: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-catalog',
    data: [
      {
        key: 'series1',
        label: 'Series 1',
        color: 'blue',
        data: generateLinearData(8),
      },
      {
        key: 'series2',
        label: 'Series 2',
        color: 'purple',
        data: generateLinearData(8),
      },
    ],
    showLegend: true,
    showGrid: true,
  },
  decorators: [CatalogDecorator],
  parameters: {
    pseudo: { hover: ['.content'] },
    catalog: {
      dimensions: [
        {
          name: 'colors',
          values: [
            'blue',
            'purple',
            'turquoise',
            'orange',
            'pink',
            'red',
            'yellow',
            'green',
            'sky',
          ],
          props: (color: string) => ({
            data: [
              {
                key: 'series',
                label: `${color} Series`,
                color,
                data: generateLinearData(8),
              },
            ],
          }),
        },
      ],
    },
  },
};
