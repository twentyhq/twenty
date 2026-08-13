import { WidgetCardHeaderAction } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderAction';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { IconArrowUpRight, IconCopy } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta: Meta<typeof WidgetCardHeaderAction> = {
  title: 'Modules/PageLayout/Widgets/WidgetCardHeaderAction',
  component: WidgetCardHeaderAction,
  decorators: [MemoryRouterDecorator, ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof WidgetCardHeaderAction>;

export const WithOnClick: Story = {
  args: {
    headerAction: {
      Icon: IconCopy,
      label: 'Copy transcript',
      onClick: () => {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Copy transcript' });
    expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};

export const WithLink: Story = {
  args: {
    headerAction: {
      Icon: IconArrowUpRight,
      label: 'See all',
      to: '/objects/callRecordings',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = await canvas.findByRole('link');
    expect(link).toHaveAttribute('href', '/objects/callRecordings');
  },
};
