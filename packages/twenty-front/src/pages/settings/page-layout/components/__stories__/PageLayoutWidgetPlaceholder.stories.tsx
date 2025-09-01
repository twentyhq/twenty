import { GraphWidgetGaugeChart } from '@/dashboards/graphs/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/dashboards/graphs/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/graphs/components/GraphWidgetPieChart';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutWidgetPlaceholder } from '../PageLayoutWidgetPlaceholder';

const meta: Meta<typeof PageLayoutWidgetPlaceholder> = {
  title: 'Pages/Settings/PageLayout/PageLayoutWidgetPlaceholder',
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

export const Empty: Story = {
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
};

export const WithNumberChart: Story = {
  args: {
    title: 'Sales Pipeline',
    children: <GraphWidgetNumberChart value="1,234" trendPercentage={12.5} />,
  },
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
        showValue={true}
        id="gauge-chart-story"
      />
    ),
  },
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
        showLegend={true}
        displayType="percentage"
        id="pie-chart-story"
      />
    ),
  },
};

export const WithCloseButton: Story = {
  args: {
    title: 'Removable Widget',
    onRemove: () => {},
    children: <GraphWidgetNumberChart value="42" trendPercentage={-5.2} />,
  },
};

export const NoContent: Story = {
  args: {
    title: 'Empty Content Widget',
  },
  parameters: {
    docs: {
      description: {
        story: 'Widget with title but no content',
      },
    },
  },
};

export const LongTitle: Story = {
  args: {
    title: 'This is a very long widget title that should be handled gracefully',
    children: <GraphWidgetNumberChart value="999" trendPercentage={0} />,
  },
};
