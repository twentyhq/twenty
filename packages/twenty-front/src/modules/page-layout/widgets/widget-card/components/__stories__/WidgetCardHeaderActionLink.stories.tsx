import { WidgetCardHeaderActionLink } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionLink';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta: Meta<typeof WidgetCardHeaderActionLink> = {
  title: 'Modules/PageLayout/Widgets/WidgetCardHeaderActionLink',
  component: WidgetCardHeaderActionLink,
  decorators: [MemoryRouterDecorator, ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof WidgetCardHeaderActionLink>;

export const Default: Story = {
  args: {
    Icon: IconArrowUpRight,
    label: 'See all',
    to: '/objects/callRecordings',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = await canvas.findByRole('link', { name: 'See all' });

    expect(link).toHaveAttribute('href', '/objects/callRecordings');
    expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};
