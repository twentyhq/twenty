import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { createDefaultGraphWidget } from '@/page-layout/utils/createDefaultGraphWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { GraphType } from '~/generated-metadata/graphql';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui/testing';

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
    widget: createDefaultGraphWidget(
      'widget-1',
      'tab-overview',
      'Sales Pipeline',
      GraphType.NUMBER,
      {
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 3,
      },
    ),
  },
  render: (args) => (
    <div style={{ width: '300px', height: '100px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const WithGaugeChart: Story = {
  args: {
    widget: createDefaultGraphWidget(
      'widget-1',
      'tab-overview',
      'Conversion Rate',
      GraphType.GAUGE,
      {
        row: 0,
        column: 0,
        rowSpan: 5,
        columnSpan: 3,
      },
    ),
  },
  render: (args) => (
    <div style={{ width: '300px', height: '400px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const WithPieChart: Story = {
  args: {
    widget: createDefaultGraphWidget(
      'widget-1',
      'tab-overview',
      'Lead Distribution',
      GraphType.PIE,
      {
        row: 0,
        column: 0,
        rowSpan: 5,
        columnSpan: 3,
      },
    ),
  },
  render: (args) => (
    <div style={{ width: '300px', height: '500px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const SmallWidget: Story = {
  args: {
    widget: createDefaultGraphWidget(
      'widget-1',
      'tab-overview',
      'Small Widget (2x2 grid)',
      GraphType.NUMBER,
      {
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 2,
      },
    ),
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
    widget: createDefaultGraphWidget(
      'widget-1',
      'tab-overview',
      'Medium Widget (4x3 grid)',
      GraphType.GAUGE,
      {
        row: 0,
        column: 0,
        rowSpan: 3,
        columnSpan: 4,
      },
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
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const LargeWidget: Story = {
  args: {
    widget: createDefaultGraphWidget(
      'widget-1',
      'tab-overview',
      'Large Widget (6x4 grid)',
      GraphType.PIE,
      {
        row: 0,
        column: 0,
        rowSpan: 4,
        columnSpan: 6,
      },
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
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const WideWidget: Story = {
  args: {
    widget: createDefaultGraphWidget(
      'widget-1',
      'tab-overview',
      'Wide Widget (8x2 grid)',
      GraphType.NUMBER,
      {
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 8,
      },
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
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const TallWidget: Story = {
  args: {
    widget: createDefaultGraphWidget(
      'widget-1',
      'tab-overview',
      'Tall Widget (3x6 grid)',
      GraphType.GAUGE,
      {
        row: 0,
        column: 0,
        rowSpan: 6,
        columnSpan: 3,
      },
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
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};
