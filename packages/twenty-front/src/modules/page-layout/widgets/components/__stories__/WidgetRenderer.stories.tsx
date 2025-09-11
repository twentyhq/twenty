import { GraphType } from '@/page-layout/mocks/mockWidgets';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui/testing';
import { WidgetType } from '~/generated/graphql';

const meta: Meta<typeof WidgetRenderer> = {
  title: 'Modules/PageLayout/Widgets/WidgetRenderer',
  component: WidgetRenderer,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    widget: {
      control: 'object',
      description: 'Widget',
    },
    displayDragHandle: {
      control: 'boolean',
      description: 'Display drag handle',
    },
    onRemove: {
      action: 'onRemove',
    },
    onEdit: {
      action: 'onEdit',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WidgetRenderer>;

export const WithNumberChart: Story = {
  args: {
    widget: {
      title: 'Sales Pipeline',
      type: WidgetType.GRAPH,
      configuration: {
        graphType: GraphType.NUMBER,
      },
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 3,
      },
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      data: {
        value: '1,234',
        trendPercentage: 12.5,
      },
    },
    displayDragHandle: true,
  },
  render: (args) => (
    <div style={{ width: '300px', height: '100px' }}>
      <WidgetRenderer
        widget={args.widget}
        displayDragHandle={args.displayDragHandle}
        onRemove={args.onRemove}
        onEdit={args.onEdit}
      />
    </div>
  ),
};

export const WithGaugeChart: Story = {
  args: {
    widget: {
      title: 'Conversion Rate',
      type: WidgetType.GRAPH,
      configuration: {
        graphType: GraphType.GAUGE,
      },
      data: {
        value: 0.5,
        min: 0,
        max: 1,
        label: 'Conversion rate',
      },
      createdAt: '2024-01-01T00:00:00Z',
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 5,
        columnSpan: 3,
      },
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  render: (args) => (
    <div style={{ width: '300px', height: '400px' }}>
      <WidgetRenderer
        widget={args.widget}
        displayDragHandle={args.displayDragHandle}
        onRemove={args.onRemove}
        onEdit={args.onEdit}
      />
    </div>
  ),
};

export const WithPieChart: Story = {
  args: {
    widget: {
      title: 'Lead Distribution',
      type: WidgetType.GRAPH,
      configuration: {
        graphType: GraphType.PIE,
      },
      data: {
        items: [
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
        ],
      },
      createdAt: '2024-01-01T00:00:00Z',
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 5,
        columnSpan: 3,
      },
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  render: (args) => (
    <div style={{ width: '300px', height: '500px' }}>
      <WidgetRenderer
        widget={args.widget}
        displayDragHandle={args.displayDragHandle}
        onRemove={args.onRemove}
        onEdit={args.onEdit}
      />
    </div>
  ),
};

export const SmallWidget: Story = {
  args: {
    widget: {
      title: 'Small Widget (2x2 grid)',
      type: WidgetType.GRAPH,
      configuration: {
        graphType: GraphType.NUMBER,
      },
      data: {
        value: '42',
        trendPercentage: 5,
      },
      createdAt: '2024-01-01T00:00:00Z',
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 2,
      },
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      updatedAt: '2024-01-01T00:00:00Z',
    },
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
      <WidgetRenderer
        widget={args.widget}
        displayDragHandle={args.displayDragHandle}
        onRemove={args.onRemove}
        onEdit={args.onEdit}
      />
    </div>
  ),
};

export const MediumWidget: Story = {
  args: {
    widget: {
      title: 'Medium Widget (4x3 grid)',
      type: WidgetType.GRAPH,
      configuration: {
        graphType: GraphType.GAUGE,
      },
      data: {
        value: 0.75,
        min: 0,
        max: 1,
        label: 'Progress',
      },
      createdAt: '2024-01-01T00:00:00Z',
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 3,
        columnSpan: 4,
      },
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      updatedAt: '2024-01-01T00:00:00Z',
    },
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
      <WidgetRenderer
        widget={args.widget}
        displayDragHandle={args.displayDragHandle}
        onRemove={args.onRemove}
        onEdit={args.onEdit}
      />
    </div>
  ),
};

export const LargeWidget: Story = {
  args: {
    widget: {
      title: 'Large Widget (6x4 grid)',
      type: WidgetType.GRAPH,
      configuration: {
        graphType: GraphType.PIE,
      },
      data: {
        items: [
          { id: 'a', value: 40, label: 'Category A', to: '/a' },
          { id: 'b', value: 30, label: 'Category B', to: '/b' },
          { id: 'c', value: 20, label: 'Category C', to: '/c' },
          { id: 'd', value: 10, label: 'Category D', to: '/d' },
        ],
      },
      createdAt: '2024-01-01T00:00:00Z',
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 4,
        columnSpan: 6,
      },
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      updatedAt: '2024-01-01T00:00:00Z',
    },
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
      <WidgetRenderer
        widget={args.widget}
        displayDragHandle={args.displayDragHandle}
        onRemove={args.onRemove}
        onEdit={args.onEdit}
      />
    </div>
  ),
};

export const WideWidget: Story = {
  args: {
    widget: {
      title: 'Wide Widget (8x2 grid)',
      type: WidgetType.GRAPH,
      configuration: {
        graphType: GraphType.NUMBER,
      },
      data: {
        value: '1,234,567',
        trendPercentage: 23.4,
      },
      createdAt: '2024-01-01T00:00:00Z',
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 8,
      },
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      updatedAt: '2024-01-01T00:00:00Z',
    },
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
      <WidgetRenderer
        widget={args.widget}
        displayDragHandle={args.displayDragHandle}
        onRemove={args.onRemove}
        onEdit={args.onEdit}
      />
    </div>
  ),
};

export const TallWidget: Story = {
  args: {
    widget: {
      title: 'Tall Widget (3x6 grid)',
      type: WidgetType.GRAPH,
      configuration: {
        graphType: GraphType.GAUGE,
      },
      data: {
        value: 0.33,
        min: 0,
        max: 1,
        label: 'Utilization',
      },
      createdAt: '2024-01-01T00:00:00Z',
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 6,
        columnSpan: 3,
      },
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
      updatedAt: '2024-01-01T00:00:00Z',
    },
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
      <WidgetRenderer
        widget={args.widget}
        displayDragHandle={args.displayDragHandle}
        onRemove={args.onRemove}
        onEdit={args.onEdit}
      />
    </div>
  ),
};
