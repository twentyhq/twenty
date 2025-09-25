import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { GraphType } from '@/page-layout/mocks/mockWidgets';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui/testing';
import { WidgetType } from '~/generated/graphql';

const meta: Meta<typeof WidgetRenderer> = {
  title: 'Modules/PageLayout/Widgets/WidgetRenderer',
  component: WidgetRenderer,
  decorators: [
    (Story, context) => (
      <PageLayoutTestWrapper>{Story(context)}</PageLayoutTestWrapper>
    ),
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
    },
  },
  render: (args) => (
    <div style={{ width: '300px', height: '100px' }}>
      <WidgetRenderer widget={args.widget} />
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
      <WidgetRenderer widget={args.widget} />
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
      <WidgetRenderer widget={args.widget} />
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
      <WidgetRenderer widget={args.widget} />
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
      <WidgetRenderer widget={args.widget} />
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
      <WidgetRenderer widget={args.widget} />
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
      <WidgetRenderer widget={args.widget} />
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
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};
