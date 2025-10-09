import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { createDefaultGraphWidget } from '@/page-layout/utils/createDefaultGraphWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { type Meta, type StoryObj } from '@storybook/react';
import { type MutableSnapshot } from 'recoil';
import { ComponentDecorator } from 'twenty-ui/testing';
import { GraphType } from '~/generated-metadata/graphql';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Company,
);
const idField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'id',
});
const createdAtField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'createdAt',
});

const meta: Meta<typeof WidgetRenderer> = {
  title: 'Modules/PageLayout/Widgets/WidgetRenderer',
  component: WidgetRenderer,
  decorators: [
    (Story, context) => {
      const initializeState = (snapshot: MutableSnapshot) => {
        snapshot.set(
          objectMetadataItemsState,
          generatedMockObjectMetadataItems,
        );
        snapshot.set(isAppWaitingForFreshObjectMetadataState, false);
      };

      return (
        <PageLayoutTestWrapper initializeState={initializeState}>
          {Story(context)}
        </PageLayoutTestWrapper>
      );
    },
    ComponentDecorator,
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    widget: {
      control: 'object',
      description: 'Widget',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WidgetRenderer>;

export const WithNumberChart: Story = {
  args: {
    widget: createDefaultGraphWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      title: 'Sales Pipeline',
      graphType: GraphType.NUMBER,
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 3,
      },
      fieldSelection: {
        objectMetadataId: companyObjectMetadataItem.id,
        aggregateFieldMetadataId: idField.id,
      },
    }),
  },
  render: (args) => (
    <div style={{ width: '300px', height: '100px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const WithGaugeChart: Story = {
  args: {
    widget: createDefaultGraphWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      title: 'Conversion Rate',
      graphType: GraphType.GAUGE,
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 5,
        columnSpan: 3,
      },
      fieldSelection: {
        objectMetadataId: companyObjectMetadataItem.id,
        aggregateFieldMetadataId: idField.id,
      },
    }),
  },
  render: (args) => (
    <div style={{ width: '300px', height: '400px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const WithBarChart: Story = {
  args: {
    widget: createDefaultGraphWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      title: 'Monthly Trends',
      graphType: GraphType.BAR,
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 5,
        columnSpan: 3,
      },
      fieldSelection: {
        objectMetadataId: companyObjectMetadataItem.id,
        aggregateFieldMetadataId: idField.id,
        groupByFieldMetadataIdX: createdAtField.id,
      },
    }),
  },
  render: (args) => (
    <div style={{ width: '300px', height: '500px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const SmallWidget: Story = {
  args: {
    widget: createDefaultGraphWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      title: 'Small Widget (2x2 grid)',
      graphType: GraphType.NUMBER,
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 2,
      },
      fieldSelection: {
        objectMetadataId: companyObjectMetadataItem.id,
        aggregateFieldMetadataId: idField.id,
      },
    }),
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
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const MediumWidget: Story = {
  args: {
    widget: createDefaultGraphWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      title: 'Medium Widget (4x3 grid)',
      graphType: GraphType.BAR,
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 3,
        columnSpan: 4,
      },
      fieldSelection: {
        objectMetadataId: companyObjectMetadataItem.id,
        aggregateFieldMetadataId: idField.id,
        groupByFieldMetadataIdX: createdAtField.id,
      },
    }),
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
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const LargeWidget: Story = {
  args: {
    widget: createDefaultGraphWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      title: 'Large Widget (6x4 grid)',
      graphType: GraphType.BAR,
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 4,
        columnSpan: 6,
      },
      fieldSelection: {
        objectMetadataId: companyObjectMetadataItem.id,
        aggregateFieldMetadataId: idField.id,
        groupByFieldMetadataIdX: createdAtField.id,
      },
    }),
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
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const WideWidget: Story = {
  args: {
    widget: createDefaultGraphWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      title: 'Wide Widget (8x2 grid)',
      graphType: GraphType.NUMBER,
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 8,
      },
      fieldSelection: {
        objectMetadataId: companyObjectMetadataItem.id,
        aggregateFieldMetadataId: idField.id,
      },
    }),
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
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const TallWidget: Story = {
  args: {
    widget: createDefaultGraphWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      title: 'Tall Widget (3x6 grid)',
      graphType: GraphType.BAR,
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 6,
        columnSpan: 3,
      },
      fieldSelection: {
        objectMetadataId: companyObjectMetadataItem.id,
        aggregateFieldMetadataId: idField.id,
        groupByFieldMetadataIdX: createdAtField.id,
      },
    }),
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
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};
