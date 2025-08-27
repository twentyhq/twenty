import { type Meta, type StoryObj } from '@storybook/react';

import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';
import { GraphWidgetGaugeChart } from '../GraphWidgetGaugeChart';

const meta: Meta<typeof GraphWidgetGaugeChart> = {
  title: 'Modules/Dashboards/Graphs/GraphWidgetGaugeChart',
  component: GraphWidgetGaugeChart,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: { type: 'number' },
    },
    min: {
      control: { type: 'number' },
    },
    max: {
      control: { type: 'number' },
    },
    unit: {
      control: 'text',
    },
    showValue: {
      control: 'boolean',
    },
    legendLabel: {
      control: 'text',
    },
    tooltipHref: {
      control: 'text',
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

export const Default: Story = {
  args: {
    value: 50,
    min: 0,
    max: 100,
    unit: '%',
    showValue: true,
    legendLabel: 'Conversion rate',
    tooltipHref: 'https://example.com',
    id: 'gauge-chart-default',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        value={args.value}
        min={args.min}
        max={args.max}
        unit={args.unit}
        showValue={args.showValue}
        legendLabel={args.legendLabel}
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
          name: 'value',
          values: [0, 25, 50, 75, 100],
          props: (value: number) => ({
            value,
            min: 0,
            max: 100,
            unit: '%',
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
        value={args.value}
        min={args.min}
        max={args.max}
        unit={args.unit}
        showValue={true}
        legendLabel="Percentage"
        tooltipHref="https://example.com"
        id={args.id}
      />
    </Container>
  ),
};

export const WithoutValue: Story = {
  args: {
    value: 65,
    min: 0,
    max: 100,
    unit: '%',
    showValue: false,
    legendLabel: 'Conversion rate',
    tooltipHref: 'https://example.com',
    id: 'gauge-chart-without-value',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        value={args.value}
        min={args.min}
        max={args.max}
        unit={args.unit}
        showValue={args.showValue}
        legendLabel={args.legendLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const Revenue: Story = {
  args: {
    value: 750,
    min: 0,
    max: 1000,
    unit: 'K',
    showValue: true,
    legendLabel: 'Revenue',
    tooltipHref: 'https://example.com',
    id: 'gauge-chart-revenue',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        value={args.value}
        min={args.min}
        max={args.max}
        unit={args.unit}
        showValue={args.showValue}
        legendLabel={args.legendLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const Temperature: Story = {
  args: {
    value: 22,
    min: -10,
    max: 40,
    unit: '°C',
    showValue: true,
    legendLabel: 'Temperature',
    tooltipHref: 'https://example.com',
    id: 'gauge-chart-temperature',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        value={args.value}
        min={args.min}
        max={args.max}
        unit={args.unit}
        showValue={args.showValue}
        legendLabel={args.legendLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const Storage: Story = {
  args: {
    value: 384,
    min: 0,
    max: 512,
    unit: 'GB',
    showValue: true,
    legendLabel: 'Storage Used',
    tooltipHref: 'https://example.com',
    id: 'gauge-chart-storage',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        value={args.value}
        min={args.min}
        max={args.max}
        unit={args.unit}
        showValue={args.showValue}
        legendLabel={args.legendLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};

export const Rating: Story = {
  args: {
    value: 4.2,
    min: 0,
    max: 5,
    unit: ' ⭐',
    showValue: true,
    legendLabel: 'Average Rating',
    tooltipHref: 'https://example.com',
    id: 'gauge-chart-rating',
  },
  render: (args) => (
    <Container>
      <GraphWidgetGaugeChart
        value={args.value}
        min={args.min}
        max={args.max}
        unit={args.unit}
        showValue={args.showValue}
        legendLabel={args.legendLabel}
        tooltipHref={args.tooltipHref}
        id={args.id}
      />
    </Container>
  ),
};
