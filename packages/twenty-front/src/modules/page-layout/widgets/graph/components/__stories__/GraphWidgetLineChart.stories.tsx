import { type Meta, type StoryObj } from '@storybook/react';

import { type ComponentProps } from 'react';
import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';
import { GraphWidgetLineChart } from '../GraphWidgetLineChart';

const meta: Meta<typeof GraphWidgetLineChart> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetLineChart',
  component: GraphWidgetLineChart,
  decorators: [ComponentDecorator],
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
    enablePoints: {
      control: 'boolean',
    },
    xAxisLabel: {
      control: 'text',
    },
    yAxisLabel: {
      control: 'text',
    },
    enableArea: {
      control: 'boolean',
    },
    stackedArea: {
      control: 'boolean',
    },
    curve: {
      control: 'select',
      options: [
        'linear',
        'monotoneX',
        'step',
        'stepBefore',
        'stepAfter',
        'natural',
      ],
    },
    lineWidth: {
      control: 'number',
    },
    enableSlices: {
      control: 'select',
      options: ['x', 'y', false],
    },
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
      enablePoints={args.enablePoints}
      xAxisLabel={args.xAxisLabel}
      yAxisLabel={args.yAxisLabel}
      displayType={args.displayType}
      prefix={args.prefix}
      suffix={args.suffix}
      decimals={args.decimals}
      enableArea={args.enableArea}
      stackedArea={args.stackedArea}
      curve={args.curve}
      lineWidth={args.lineWidth}
      enableSlices={args.enableSlices}
      xScale={args.xScale}
      yScale={args.yScale}
    />
  </Container>
);

const generateLinearData = (points: number = 10) => {
  return Array.from({ length: points }, (_, i) => ({
    x: i,
    y: Math.floor(Math.random() * 100) + 20,
  }));
};

export const Default: Story = {
  args: {
    id: 'line-chart-default',
    data: [
      {
        id: 'series1',
        label: 'Revenue',
        color: 'blue',
        data: generateLinearData(12),
      },
      {
        id: 'series2',
        label: 'Profit',
        color: 'turquoise',
        data: generateLinearData(12),
      },
    ],
    showLegend: true,
    showGrid: true,
    enablePoints: false,
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
        id: 'sales',
        label: 'Sales',
        color: 'purple',
        data: generateLinearData(12),
      },
      {
        id: 'costs',
        label: 'Costs',
        color: 'orange',
        data: generateLinearData(12),
      },
    ],
    enableArea: true,
    showLegend: true,
    showGrid: true,
    enablePoints: false,
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
        id: 'product-a',
        label: 'Product A',
        color: 'blue',
        data: generateLinearData(8),
      },
      {
        id: 'product-b',
        label: 'Product B',
        color: 'turquoise',
        data: generateLinearData(8),
      },
      {
        id: 'product-c',
        label: 'Product C',
        color: 'purple',
        data: generateLinearData(8),
      },
    ],
    enableArea: true,
    stackedArea: true,
    showLegend: true,
    showGrid: true,
    enablePoints: false,
    curve: 'monotoneX',
    xAxisLabel: 'Quarter',
    yAxisLabel: 'Revenue',
    yScale: {
      type: 'linear',
      min: 0,
      max: 'auto',
    },
    displayType: 'shortNumber',
    prefix: '$',
  },
};

export const WithPoints: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-points',
    data: [
      {
        id: 'performance',
        label: 'Performance',
        color: 'pink',
        data: generateLinearData(8),
      },
    ],
    showLegend: true,
    showGrid: true,
    enablePoints: true,
    lineWidth: 3,
    xAxisLabel: 'Week',
    yAxisLabel: 'Score',
    displayType: 'percentage',
  },
};

export const StepChart: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-step',
    data: [
      {
        id: 'inventory',
        label: 'Inventory Level',
        color: 'orange',
        data: generateLinearData(10),
      },
    ],
    curve: 'step',
    showLegend: true,
    showGrid: true,
    enablePoints: false,
    lineWidth: 2,
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
        id: 'exponential',
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
        id: 'linear',
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
    enablePoints: true,
    xAxisLabel: 'Time',
    yAxisLabel: 'Value (log scale)',
    yScale: {
      type: 'log',
      base: 10,
      min: 'auto',
      max: 'auto',
    },
    displayType: 'shortNumber',
  },
};

export const WithNullValues: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-nulls',
    data: [
      {
        id: 'incomplete',
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
    enablePoints: true,
    xAxisLabel: 'Time',
    yAxisLabel: 'Measurement',
    displayType: 'number',
  },
};

export const InteractiveWithLinks: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-interactive',
    data: [
      {
        id: 'clickable',
        label: 'Click Points',
        color: 'turquoise',
        data: [
          { x: 0, y: 30, to: '#point-0' },
          { x: 1, y: 45, to: '#point-1' },
          { x: 2, y: 38, to: '#point-2' },
          { x: 3, y: 52, to: '#point-3' },
          { x: 4, y: 48, to: '#point-4' },
          { x: 5, y: 60, to: '#point-5' },
        ],
      },
    ],
    showLegend: true,
    showGrid: true,
    enablePoints: true,
    enableSlices: false,
    xAxisLabel: 'Step',
    yAxisLabel: 'Progress',
    displayType: 'percentage',
  },
};

export const MultiSeriesMixed: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-mixed',
    data: [
      {
        id: 'actual',
        label: 'Actual',
        color: 'blue',
        data: generateLinearData(12),
        enableArea: true,
      },
      {
        id: 'forecast',
        label: 'Forecast',
        color: 'purple',
        data: generateLinearData(12),
        enableArea: false,
      },
      {
        id: 'target',
        label: 'Target',
        color: 'orange',
        data: generateLinearData(12).map((d) => ({ ...d, y: 75 })),
        enableArea: false,
      },
    ],
    enableArea: false,
    showLegend: true,
    showGrid: true,
    enablePoints: false,
    curve: 'monotoneX',
    xAxisLabel: 'Month',
    yAxisLabel: 'Value',
    displayType: 'shortNumber',
    enableSlices: 'x',
  },
};

export const OverlappingGradientBlend: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-blend',
    data: [
      {
        id: 'red-series',
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
        id: 'blue-series',
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
        id: 'green-series',
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
    enableArea: true,
    showLegend: true,
    showGrid: true,
    enablePoints: false,
    curve: 'monotoneX',
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
        id: 'yellow-series',
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
        id: 'purple-series',
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
    enableArea: true,
    showLegend: true,
    showGrid: true,
    enablePoints: true,
    curve: 'natural',
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
        id: 'dataset',
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
    enablePoints: true,
    curve: 'linear',
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
        id: 'step-normal',
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
        id: 'step-before',
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
        id: 'step-after',
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
    enablePoints: true,
    curve: 'step',
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
        id: 'natural',
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
        id: 'monotone',
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
    enableArea: true,
    showLegend: true,
    showGrid: true,
    enablePoints: true,
    curve: 'natural',
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
        id: 'revenue',
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
        id: 'costs',
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
        id: 'profit',
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
    enablePoints: false,
    enableSlices: 'x',
    xScale: { type: 'point' },
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
        id: 'revenue',
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
        id: 'costs',
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
        id: 'profit',
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
    enablePoints: true,
    enableSlices: false,
    xScale: { type: 'point' },
    xAxisLabel: 'Month',
    yAxisLabel: 'Amount ($)',
    displayType: 'shortNumber',
    prefix: '$',
  },
};

export const IntenseOverlapRGB: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-rgb',
    data: [
      {
        id: 'red',
        label: 'Red Channel',
        color: 'red',
        data: [
          { x: 0, y: 70 },
          { x: 1, y: 85 },
          { x: 2, y: 75 },
          { x: 3, y: 90 },
          { x: 4, y: 80 },
          { x: 5, y: 85 },
        ],
      },
      {
        id: 'green',
        label: 'Green Channel',
        color: 'turquoise',
        data: [
          { x: 0, y: 65 },
          { x: 1, y: 75 },
          { x: 2, y: 85 },
          { x: 3, y: 80 },
          { x: 4, y: 75 },
          { x: 5, y: 70 },
        ],
      },
      {
        id: 'blue',
        label: 'Blue Channel',
        color: 'blue',
        data: [
          { x: 0, y: 60 },
          { x: 1, y: 70 },
          { x: 2, y: 80 },
          { x: 3, y: 75 },
          { x: 4, y: 85 },
          { x: 5, y: 80 },
        ],
      },
    ],
    enableArea: true,
    showLegend: true,
    showGrid: true,
    enablePoints: false,
    curve: 'monotoneX',
    xAxisLabel: 'Position',
    yAxisLabel: 'Intensity',
    displayType: 'percentage',
  },
};

export const Catalog: Story = {
  render: renderChart,
  args: {
    id: 'line-chart-catalog',
    data: [
      {
        id: 'series1',
        label: 'Series 1',
        color: 'blue',
        data: generateLinearData(8),
      },
      {
        id: 'series2',
        label: 'Series 2',
        color: 'purple',
        data: generateLinearData(8),
      },
    ],
    showLegend: true,
    showGrid: true,
    enablePoints: false,
    enableArea: true,
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
                id: 'series',
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
