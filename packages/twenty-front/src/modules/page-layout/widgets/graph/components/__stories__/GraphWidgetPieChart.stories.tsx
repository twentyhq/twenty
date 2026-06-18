import { type Meta, type StoryObj } from '@storybook/react-vite';

import { CoreObjectNameSingular } from 'twenty-shared/types';
import { GraphWidgetTestWrapper } from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { GraphWidgetPieChart } from '@/page-layout/widgets/graph/graph-widget-pie-chart/components/GraphWidgetPieChart';
import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';
import {
  AggregateOperations,
  WidgetConfigurationType,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';
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
type Story = StoryObj<typeof GraphWidgetPieChart>;

const Container = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '300px', height: '300px' }}>{children}</div>
);

export const Default: Story = {
  args: {
    data: [
      { key: 'Qualified', value: 35 },
      { key: 'Contacted', value: 25 },
      { key: 'Unqualified', value: 20 },
      { key: 'Proposal', value: 15 },
      { key: 'Negotiation', value: 5 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};

export const WithCenterMetric: Story = {
  args: {
    data: [
      { key: 'Qualified', value: 35 },
      { key: 'Contacted', value: 25 },
      { key: 'Unqualified', value: 20 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};

export const WithDataLabels: Story = {
  args: {
    data: [
      { key: 'Qualified', value: 35 },
      { key: 'Contacted', value: 25 },
      { key: 'Unqualified', value: 20 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};
export const Revenue: Story = {
  args: {
    data: [
      { key: 'Product A', value: 420000 },
      { key: 'Product B', value: 380000 },
      { key: 'Product C', value: 250000 },
      { key: 'Product D', value: 180000 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};

export const TaskStatus: Story = {
  args: {
    data: [
      { key: 'Completed', value: 45 },
      { key: 'In Progress', value: 30 },
      { key: 'To Do', value: 25 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};

export const TwoSlices: Story = {
  args: {
    data: [
      { key: 'Active', value: 75 },
      { key: 'Inactive', value: 25 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};

export const ManySlices: Story = {
  args: {
    data: [
      { key: 'Category 1', value: 20 },
      { key: 'Category 2', value: 18 },
      { key: 'Category 3', value: 16 },
      { key: 'Category 4', value: 14 },
      { key: 'Category 5', value: 12 },
      { key: 'Category 6', value: 10 },
      { key: 'Category 7', value: 6 },
      { key: 'Category 8', value: 4 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};

export const WithoutLegend: Story = {
  args: {
    data: [
      { key: 'Web', value: 45 },
      { key: 'Mobile', value: 35 },
      { key: 'Desktop', value: 20 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};

export const MarketShare: Story = {
  args: {
    data: [
      { key: 'Brand A', value: 35.5 },
      { key: 'Brand B', value: 28.2 },
      { key: 'Brand C', value: 18.7 },
      { key: 'Others', value: 17.6 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};

export const Storage: Story = {
  args: {
    data: [
      { key: 'Documents', value: 125 },
      { key: 'Media', value: 280 },
      { key: 'Applications', value: 95 },
      { key: 'System', value: 50 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};

export const Catalog: Story = {
  decorators: [
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
              Array<{ key: string; value: number }>
            > = {
              2: [
                { key: 'Yes', value: 65 },
                { key: 'No', value: 35 },
              ],
              3: [
                { key: 'Gold', value: 45 },
                { key: 'Silver', value: 35 },
                { key: 'Bronze', value: 20 },
              ],
              5: [
                { key: 'Item 1', value: 30 },
                { key: 'Item 2', value: 25 },
                { key: 'Item 3', value: 20 },
                { key: 'Item 4', value: 15 },
                { key: 'Item 5', value: 10 },
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
        colorMode={args.colorMode}
      />
    </Container>
  ),
};
