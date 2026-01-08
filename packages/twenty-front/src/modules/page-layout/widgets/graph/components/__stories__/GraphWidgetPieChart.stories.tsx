import { type Meta, type StoryObj } from '@storybook/react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { GraphWidgetTestWrapper } from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { GraphWidgetPieChart } from '@/page-layout/widgets/graph/graphWidgetPieChart/components/GraphWidgetPieChart';
import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';
import {
  AggregateOperations,
  WidgetConfigurationType,
  type PieChartConfiguration,
} from '~/generated/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Company,
);
const idField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'id',
});

const mockObjectMetadataItemId = companyObjectMetadataItem.id;
const mockConfiguration: PieChartConfiguration = {
  aggregateFieldMetadataId: idField.id,
  aggregateOperation: AggregateOperations.COUNT,
  configurationType: WidgetConfigurationType.PIE_CHART,
  groupByFieldMetadataId: idField.id,
};

const meta: Meta<typeof GraphWidgetPieChart> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetPieChart',
  component: GraphWidgetPieChart,
  decorators: [
    I18nFrontDecorator,
    ObjectMetadataItemsDecorator,
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
    id: {
      control: 'text',
    },
    showCenterMetric: {
      control: 'boolean',
    },
    showDataLabels: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GraphWidgetPieChart>;

const Container = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '300px', height: '300px' }}>{children}</div>
);

export const Default: Story = {
  args: {
    data: [
      { id: 'Qualified', value: 35 },
      { id: 'Contacted', value: 25 },
      { id: 'Unqualified', value: 20 },
      { id: 'Proposal', value: 15 },
      { id: 'Negotiation', value: 5 },
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
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};

export const WithCenterMetric: Story = {
  args: {
    data: [
      { id: 'Qualified', value: 35 },
      { id: 'Contacted', value: 25 },
      { id: 'Unqualified', value: 20 },
    ],
    showCenterMetric: true,
    id: 'pie-chart-with-center-metric',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        showCenterMetric={args.showCenterMetric}
        id={args.id}
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};

export const WithDataLabels: Story = {
  args: {
    data: [
      { id: 'Qualified', value: 35 },
      { id: 'Contacted', value: 25 },
      { id: 'Unqualified', value: 20 },
    ],
    showDataLabels: true,
    id: 'pie-chart-with-data-labels',
  },
  render: (args) => (
    <Container>
      <GraphWidgetPieChart
        data={args.data}
        showDataLabels={args.showDataLabels}
        id={args.id}
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};
export const Revenue: Story = {
  args: {
    data: [
      { id: 'Product A', value: 420000 },
      { id: 'Product B', value: 380000 },
      { id: 'Product C', value: 250000 },
      { id: 'Product D', value: 180000 },
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
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};

export const TaskStatus: Story = {
  args: {
    data: [
      { id: 'Completed', value: 45 },
      { id: 'In Progress', value: 30 },
      { id: 'To Do', value: 25 },
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
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};

export const TwoSlices: Story = {
  args: {
    data: [
      { id: 'Active', value: 75 },
      { id: 'Inactive', value: 25 },
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
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};

export const ManySlices: Story = {
  args: {
    data: [
      { id: 'Category 1', value: 20 },
      { id: 'Category 2', value: 18 },
      { id: 'Category 3', value: 16 },
      { id: 'Category 4', value: 14 },
      { id: 'Category 5', value: 12 },
      { id: 'Category 6', value: 10 },
      { id: 'Category 7', value: 6 },
      { id: 'Category 8', value: 4 },
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
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};

export const WithoutLegend: Story = {
  args: {
    data: [
      { id: 'Web', value: 45 },
      { id: 'Mobile', value: 35 },
      { id: 'Desktop', value: 20 },
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
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};

export const MarketShare: Story = {
  args: {
    data: [
      { id: 'Brand A', value: 35.5 },
      { id: 'Brand B', value: 28.2 },
      { id: 'Brand C', value: 18.7 },
      { id: 'Others', value: 17.6 },
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
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};

export const Storage: Story = {
  args: {
    data: [
      { id: 'Documents', value: 125 },
      { id: 'Media', value: 280 },
      { id: 'Applications', value: 95 },
      { id: 'System', value: 50 },
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
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};

export const Catalog: Story = {
  decorators: [
    I18nFrontDecorator,
    ObjectMetadataItemsDecorator,
    (Story) => (
      <GraphWidgetTestWrapper>
        <Story />
      </GraphWidgetTestWrapper>
    ),
    CatalogDecorator,
  ],
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'slices',
          values: [2, 3, 5],
          props: (sliceCount: number) => {
            const dataMap: Record<
              number,
              Array<{ id: string; value: number }>
            > = {
              2: [
                { id: 'Yes', value: 65 },
                { id: 'No', value: 35 },
              ],
              3: [
                { id: 'Gold', value: 45 },
                { id: 'Silver', value: 35 },
                { id: 'Bronze', value: 20 },
              ],
              5: [
                { id: 'Item 1', value: 30 },
                { id: 'Item 2', value: 25 },
                { id: 'Item 3', value: 20 },
                { id: 'Item 4', value: 15 },
                { id: 'Item 5', value: 10 },
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
        objectMetadataItemId={mockObjectMetadataItemId}
        configuration={mockConfiguration}
      />
    </Container>
  ),
};
