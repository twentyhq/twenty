import { type Meta, type StoryObj } from '@storybook/react';

import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';
import { GraphWidgetPieChart } from '../GraphWidgetPieChart';

const meta: Meta<typeof GraphWidgetPieChart> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetPieChart',
  component: GraphWidgetPieChart,
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
    id: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GraphWidgetPieChart>;

const Container = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '300px', height: '300px' }}>{children}</div>
);

export const WithCustomColors: Story = {
  args: {
    data: [
      {
        id: 'segment1',
        value: 30,
        label: 'Segment A',
        color: 'blue',
        to: '/segments/a',
      },
      {
        id: 'segment2',
        value: 25,
        label: 'Segment B',
        color: 'purple',
        to: '/segments/b',
      },
      {
        id: 'segment3',
        value: 20,
        label: 'Segment C',
        color: 'turquoise',
        to: '/segments/c',
      },
      {
        id: 'segment4',
        value: 15,
        label: 'Segment D',
        color: 'orange',
        to: '/segments/d',
      },
      {
        id: 'segment5',
        value: 10,
        label: 'Segment E',
        color: 'pink',
        to: '/segments/e',
      },
    ],
    showLegend: true,
    id: 'pie-chart-custom-colors',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        displayType={args.displayType}
        prefix={args.prefix}
        suffix={args.suffix}
        decimals={args.decimals}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const Default: Story = {
  args: {
    data: [
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
      { id: 'proposal', value: 15, label: 'Proposal', to: '/leads/proposal' },
      {
        id: 'negotiation',
        value: 5,
        label: 'Negotiation',
        to: '/leads/negotiation',
      },
    ],
    showLegend: true,
    id: 'pie-chart-default',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        displayType={args.displayType}
        prefix={args.prefix}
        suffix={args.suffix}
        decimals={args.decimals}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const Revenue: Story = {
  args: {
    data: [
      {
        id: 'product-a',
        value: 420000,
        label: 'Product A',
        to: '/products/a/revenue',
      },
      {
        id: 'product-b',
        value: 380000,
        label: 'Product B',
        to: '/products/b/revenue',
      },
      {
        id: 'product-c',
        value: 250000,
        label: 'Product C',
        to: '/products/c/revenue',
      },
      {
        id: 'product-d',
        value: 180000,
        label: 'Product D',
        to: '/products/d/revenue',
      },
    ],
    prefix: '$',
    displayType: 'shortNumber',
    showLegend: true,
    id: 'pie-chart-revenue',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        displayType={args.displayType}
        prefix={args.prefix}
        suffix={args.suffix}
        decimals={args.decimals}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const TaskStatus: Story = {
  args: {
    data: [
      {
        id: 'completed',
        value: 45,
        label: 'Completed',
        to: '/tasks/completed',
      },
      {
        id: 'in-progress',
        value: 30,
        label: 'In Progress',
        to: '/tasks/in-progress',
      },
      { id: 'todo', value: 25, label: 'To Do', to: '/tasks/todo' },
    ],
    displayType: 'percentage',
    showLegend: true,
    id: 'pie-chart-task-status',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        displayType={args.displayType}
        prefix={args.prefix}
        suffix={args.suffix}
        decimals={args.decimals}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const TwoSlices: Story = {
  args: {
    data: [
      { id: 'active', value: 75, label: 'Active', to: '/users/active' },
      { id: 'inactive', value: 25, label: 'Inactive', to: '/users/inactive' },
    ],
    displayType: 'percentage',
    showLegend: true,
    id: 'pie-chart-two-slices',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        displayType={args.displayType}
        prefix={args.prefix}
        suffix={args.suffix}
        decimals={args.decimals}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const ManySlices: Story = {
  args: {
    data: [
      { id: 'category-1', value: 20, label: 'Category 1', to: '/categories/1' },
      { id: 'category-2', value: 18, label: 'Category 2', to: '/categories/2' },
      { id: 'category-3', value: 16, label: 'Category 3', to: '/categories/3' },
      { id: 'category-4', value: 14, label: 'Category 4', to: '/categories/4' },
      { id: 'category-5', value: 12, label: 'Category 5', to: '/categories/5' },
      { id: 'category-6', value: 10, label: 'Category 6', to: '/categories/6' },
      { id: 'category-7', value: 6, label: 'Category 7' },
      { id: 'category-8', value: 4, label: 'Category 8' },
    ],
    showLegend: true,
    id: 'pie-chart-many-slices',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        displayType={args.displayType}
        prefix={args.prefix}
        suffix={args.suffix}
        decimals={args.decimals}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const WithoutLegend: Story = {
  args: {
    data: [
      { id: 'web', value: 45, label: 'Web', to: '/platforms/web' },
      { id: 'mobile', value: 35, label: 'Mobile', to: '/platforms/mobile' },
      { id: 'desktop', value: 20, label: 'Desktop', to: '/platforms/desktop' },
    ],
    displayType: 'percentage',
    showLegend: false,
    id: 'pie-chart-without-legend',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        displayType={args.displayType}
        prefix={args.prefix}
        suffix={args.suffix}
        decimals={args.decimals}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const MarketShare: Story = {
  args: {
    data: [
      { id: 'brand-a', value: 35.5, label: 'Brand A', to: '/market/brand-a' },
      { id: 'brand-b', value: 28.2, label: 'Brand B', to: '/market/brand-b' },
      { id: 'brand-c', value: 18.7, label: 'Brand C', to: '/market/brand-c' },
      { id: 'others', value: 17.6, label: 'Others', to: '/market/others' },
    ],
    displayType: 'percentage',
    showLegend: true,
    id: 'pie-chart-market-share',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        displayType={args.displayType}
        prefix={args.prefix}
        suffix={args.suffix}
        decimals={args.decimals}
        showLegend={args.showLegend}
        id={args.id}
      />
    </Container>
  ),
};

export const Storage: Story = {
  args: {
    data: [
      {
        id: 'documents',
        value: 125,
        label: 'Documents',
        to: '/storage/documents',
      },
      { id: 'media', value: 280, label: 'Media', to: '/storage/media' },
      {
        id: 'applications',
        value: 95,
        label: 'Applications',
        to: '/storage/applications',
      },
      { id: 'system', value: 50, label: 'System', to: '/storage/system' },
    ],
    suffix: ' GB',
    showLegend: true,
    id: 'pie-chart-storage',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        displayType={args.displayType}
        prefix={args.prefix}
        suffix={args.suffix}
        decimals={args.decimals}
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
          name: 'slices',
          values: [2, 3, 5],
          props: (sliceCount: number) => {
            const dataMap: Record<
              number,
              Array<{ id: string; value: number; label?: string }>
            > = {
              2: [
                { id: 'yes', value: 65, label: 'Yes' },
                { id: 'no', value: 35, label: 'No' },
              ],
              3: [
                { id: 'gold', value: 45, label: 'Gold' },
                { id: 'silver', value: 35, label: 'Silver' },
                { id: 'bronze', value: 20, label: 'Bronze' },
              ],
              5: [
                { id: 'item-1', value: 30, label: 'Item 1' },
                { id: 'item-2', value: 25, label: 'Item 2' },
                { id: 'item-3', value: 20, label: 'Item 3' },
                { id: 'item-4', value: 15, label: 'Item 4' },
                { id: 'item-5', value: 10, label: 'Item 5' },
              ],
            };

            return {
              data: dataMap[sliceCount] || dataMap[3],
              id: `pie-chart-catalog-${sliceCount}`,
            };
          },
          labels: (sliceCount: number) => `${sliceCount} slices`,
        },
      ],
    },
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        displayType="percentage"
        showLegend={true}
        id={args.id}
      />
    </Container>
  ),
};
