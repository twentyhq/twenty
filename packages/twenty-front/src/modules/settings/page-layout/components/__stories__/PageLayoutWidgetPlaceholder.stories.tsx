import { GraphWidgetGaugeChart } from '@/dashboards/graphs/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/dashboards/graphs/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/graphs/components/GraphWidgetPieChart';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutWidgetPlaceholder } from '../PageLayoutWidgetPlaceholder';

const meta: Meta<typeof PageLayoutWidgetPlaceholder> = {
  title: 'Modules/Settings/PageLayout/PageLayoutWidgetPlaceholder',
  component: PageLayoutWidgetPlaceholder,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Widget title',
    },
    isEmpty: {
      control: 'boolean',
      description: 'Show empty state',
    },
    onRemove: {
      action: 'onRemove',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageLayoutWidgetPlaceholder>;

export const WithNumberChart: Story = {
  args: {
    title: 'Sales Pipeline',
    children: <GraphWidgetNumberChart value="1,234" trendPercentage={12.5} />,
  },
  render: (args) => (
    <div style={{ width: '300px', height: '100px' }}>
      <PageLayoutWidgetPlaceholder
        title={args.title}
        isEmpty={args.isEmpty}
        onRemove={args.onRemove}
        children={args.children}
      />
    </div>
  ),
};

export const WithGaugeChart: Story = {
  args: {
    title: 'Conversion Rate',
    children: (
      <GraphWidgetGaugeChart
        data={{
          value: 0.5,
          min: 0,
          max: 1,
          label: 'Conversion rate',
        }}
        displayType="percentage"
        showValue
        id="gauge-chart-story"
      />
    ),
  },
  render: (args) => (
    <div style={{ width: '300px', height: '400px' }}>
      <PageLayoutWidgetPlaceholder
        title={args.title}
        isEmpty={args.isEmpty}
        onRemove={args.onRemove}
        children={args.children}
      />
    </div>
  ),
};

export const EmptyState: Story = {
  args: {
    isEmpty: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty widget placeholder state with dashed border',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '500px', height: '300px' }}>
      <PageLayoutWidgetPlaceholder
        title={args.title}
        isEmpty={args.isEmpty}
        onRemove={args.onRemove}
        children={args.children}
      />
    </div>
  ),
};

export const WithPieChart: Story = {
  args: {
    title: 'Lead Distribution',
    children: (
      <GraphWidgetPieChart
        data={[
          {
            id: 'qualified',
            value: 35,
            label: 'Qualified',
            to: '/leads/qualified',
          },
          {
            id: 'contacted',
            value: 25,
            label: 'Contacted',
            to: '/leads/contacted',
          },
          {
            id: 'unqualified',
            value: 20,
            label: 'Unqualified',
            to: '/leads/unqualified',
          },
          {
            id: 'proposal',
            value: 15,
            label: 'Proposal',
            to: '/leads/proposal',
          },
          {
            id: 'negotiation',
            value: 5,
            label: 'Negotiation',
            to: '/leads/negotiation',
          },
        ]}
        showLegend
        displayType="percentage"
        id="pie-chart-story"
      />
    ),
  },
  render: (args) => (
    <div style={{ width: '300px', height: '500px' }}>
      <PageLayoutWidgetPlaceholder
        title={args.title}
        isEmpty={args.isEmpty}
        onRemove={args.onRemove}
        children={args.children}
      />
    </div>
  ),
};

export const SmallWidget: Story = {
  args: {
    title: 'Small Widget (2x2 grid)',
    children: <GraphWidgetNumberChart value="42" trendPercentage={5} />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a 2x2 grid cell widget',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '300px', height: '100px' }}>
      <PageLayoutWidgetPlaceholder
        title={args.title}
        isEmpty={args.isEmpty}
        onRemove={args.onRemove}
        children={args.children}
      />
    </div>
  ),
};

export const MediumWidget: Story = {
  args: {
    title: 'Medium Widget (4x3 grid)',
    children: (
      <GraphWidgetGaugeChart
        data={{
          value: 0.75,
          min: 0,
          max: 1,
          label: 'Progress',
        }}
        displayType="percentage"
        showValue
        id="gauge-medium"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a 4x3 grid cell widget',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '400px', height: '250px' }}>
      <PageLayoutWidgetPlaceholder
        title={args.title}
        isEmpty={args.isEmpty}
        onRemove={args.onRemove}
        children={args.children}
      />
    </div>
  ),
};

export const LargeWidget: Story = {
  args: {
    title: 'Large Widget (6x4 grid)',
    children: (
      <GraphWidgetPieChart
        data={[
          { id: 'a', value: 40, label: 'Category A', to: '/a' },
          { id: 'b', value: 30, label: 'Category B', to: '/b' },
          { id: 'c', value: 20, label: 'Category C', to: '/c' },
          { id: 'd', value: 10, label: 'Category D', to: '/d' },
        ]}
        showLegend
        displayType="percentage"
        id="pie-large"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a 6x4 grid cell widget',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '600px', height: '400px' }}>
      <PageLayoutWidgetPlaceholder
        title={args.title}
        isEmpty={args.isEmpty}
        onRemove={args.onRemove}
        children={args.children}
      />
    </div>
  ),
};

export const WideWidget: Story = {
  args: {
    title: 'Wide Widget (8x2 grid)',
    children: (
      <GraphWidgetNumberChart value="1,234,567" trendPercentage={23.4} />
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a wide 8x2 grid cell widget',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '800px', height: '200px' }}>
      <PageLayoutWidgetPlaceholder
        title={args.title}
        isEmpty={args.isEmpty}
        onRemove={args.onRemove}
        children={args.children}
      />
    </div>
  ),
};

export const TallWidget: Story = {
  args: {
    title: 'Tall Widget (3x6 grid)',
    children: (
      <GraphWidgetGaugeChart
        data={{
          value: 0.33,
          min: 0,
          max: 1,
          label: 'Utilization',
        }}
        displayType="percentage"
        showValue
        id="gauge-tall"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a tall 3x6 grid cell widget',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '300px', height: '500px' }}>
      <PageLayoutWidgetPlaceholder
        title={args.title}
        isEmpty={args.isEmpty}
        onRemove={args.onRemove}
        children={args.children}
      />
    </div>
  ),
};
