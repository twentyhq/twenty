import { type Meta, type StoryObj } from '@storybook/react-vite';

import { GraphWidgetTestWrapper } from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof GraphWidgetLegend> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetLegend',
  component: GraphWidgetLegend,
  decorators: [
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
};

export default meta;
type Story = StoryObj<typeof GraphWidgetLegend>;

export const Default: Story = {
  render: () => {
    return (
      <GraphWidgetLegend
        show={true}
        items={[
          {
            id: 'sales',
            label: 'Sales',
            color: 'blue',
          },
          {
            id: 'marketing',
            label: 'Marketing',
            color: 'green',
          },
          {
            id: 'operations',
            label: 'Operations',
            color: 'red',
          },
        ]}
      />
    );
  },
};

export const SingleItem: Story = {
  render: () => {
    return (
      <GraphWidgetLegend
        show={true}
        items={[
          {
            id: 'revenue',
            label: 'Revenue',
            color: 'blue',
          },
        ]}
      />
    );
  },
};
