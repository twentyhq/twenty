import { type Meta, type StoryObj } from '@storybook/react';

import { GraphWidgetTestWrapper } from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { GraphWidgetGaugeChart } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/components/GraphWidgetGaugeChart';
import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof GraphWidgetGaugeChart> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetGaugeChart',
  component: GraphWidgetGaugeChart,
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
    showValue: {
      control: 'boolean',
    },
    showLegend: {
      control: 'boolean',
    },
    id: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GraphWidgetGaugeChart>;

const Container = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '250px', height: '200px' }}>{children}</div>
);

export const WithCustomColors: Story = {
  args: {
    data: {
      value: 75,
      min: 0,
      max: 100,
      color: 'purple',
      label: 'Progress',
    },
    displayType: 'number',
    suffix: '%',
    showValue: true,
    id: 'gauge-chart-purple',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        data={args.data}
        displayType={args.displayType}
        decimals={args.decimals}
        prefix={args.prefix}
        suffix={args.suffix}
        showValue={args.showValue}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const Default: Story = {
  args: {
    data: {
      value: 0.5,
      min: 0,
      max: 1,
      label: 'Conversion rate',
    },
    displayType: 'percentage',
    showValue: true,
    id: 'gauge-chart-default',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        data={args.data}
        displayType={args.displayType}
        decimals={args.decimals}
        prefix={args.prefix}
        suffix={args.suffix}
        showValue={args.showValue}
        showLegend={args.showLegend}
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
          name: 'value',
          values: [0, 25, 50, 75, 100],
          props: (value: number) => ({
            data: {
              value: value / 100,
              min: 0,
              max: 1,
              label: 'Percentage',
            },
            displayType: 'percentage' as const,
            id: `gauge-chart-catalog-${value}`,
          }),
          labels: (value: number) => {
            const labelMap: Record<number, string> = {
              0: 'Empty',
              25: 'Quarter',
              50: 'Half',
              75: 'Three Quarters',
              100: 'Full',
            };
            return labelMap[value] ?? `${value}%`;
          },
        },
      ],
    },
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        data={args.data}
        displayType={args.displayType}
        showValue={true}
        id="gauge-chart-catalog"
      />
    </Container>
  ),
};

export const WithoutValue: Story = {
  args: {
    data: {
      value: 65,
      min: 0,
      max: 100,
      label: 'Conversion rate',
    },
    displayType: 'percentage',
    showValue: false,
    id: 'gauge-chart-without-value',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        data={args.data}
        displayType={args.displayType}
        decimals={args.decimals}
        prefix={args.prefix}
        suffix={args.suffix}
        showValue={args.showValue}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const Revenue: Story = {
  args: {
    data: {
      value: 750,
      min: 0,
      max: 1000,
      label: 'Revenue',
    },
    displayType: 'shortNumber',
    showValue: true,
    id: 'gauge-chart-revenue',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        data={args.data}
        displayType={args.displayType}
        decimals={args.decimals}
        prefix={args.prefix}
        suffix={args.suffix}
        showValue={args.showValue}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const Temperature: Story = {
  args: {
    data: {
      value: 22,
      min: -10,
      max: 40,
      label: 'Temperature',
    },
    suffix: '°C',
    showValue: true,
    id: 'gauge-chart-temperature',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        data={args.data}
        displayType={args.displayType}
        decimals={args.decimals}
        prefix={args.prefix}
        suffix={args.suffix}
        showValue={args.showValue}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const Storage: Story = {
  args: {
    data: {
      value: 384,
      min: 0,
      max: 512,
      label: 'Storage Used',
    },
    suffix: ' GB',
    showValue: true,
    id: 'gauge-chart-storage',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        data={args.data}
        displayType={args.displayType}
        decimals={args.decimals}
        prefix={args.prefix}
        suffix={args.suffix}
        showValue={args.showValue}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const Rating: Story = {
  args: {
    data: {
      value: 4.2,
      min: 0,
      max: 5,
      label: 'Average Rating',
    },
    suffix: ' ⭐',
    decimals: 1,
    showValue: true,
    id: 'gauge-chart-rating',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        data={args.data}
        displayType={args.displayType}
        decimals={args.decimals}
        prefix={args.prefix}
        suffix={args.suffix}
        showValue={args.showValue}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const WithoutLegend: Story = {
  args: {
    data: {
      value: 65,
      min: 0,
      max: 100,
      label: 'Conversion rate',
    },
    displayType: 'percentage',
    showValue: true,
    id: 'gauge-chart-without-legend',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        data={args.data}
        displayType={args.displayType}
        decimals={args.decimals}
        prefix={args.prefix}
        suffix={args.suffix}
        showValue={args.showValue}
        showLegend={false}
        id={args.id}
      />
    </Container>
  ),
};
