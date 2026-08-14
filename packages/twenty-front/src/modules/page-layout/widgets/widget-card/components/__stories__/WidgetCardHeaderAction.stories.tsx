import { WidgetCardHeaderAction } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderAction';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { IconArrowUpRight, IconCopy } from 'twenty-ui/icon';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta: Meta<typeof WidgetCardHeaderAction> = {
  title: 'Modules/PageLayout/Widgets/WidgetCardHeaderAction',
  component: WidgetCardHeaderAction,
  decorators: [MemoryRouterDecorator],
};

export default meta;
type Story = StoryObj<typeof WidgetCardHeaderAction>;

export const Catalog: CatalogStory<Story, typeof WidgetCardHeaderAction> = {
  decorators: [CatalogDecorator],
  args: {
    headerAction: {
      id: 'copy-transcript',
      Icon: IconCopy,
      label: 'Copy transcript',
      onClick: fn(),
    },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'action type',
          values: ['Button', 'Link'],
          props: (actionType: string) => ({
            headerAction:
              actionType === 'Link'
                ? {
                    id: 'see-all',
                    Icon: IconArrowUpRight,
                    label: 'See all',
                    to: '/objects/callRecordings',
                  }
                : {
                    id: 'copy-transcript',
                    Icon: IconCopy,
                    label: 'Copy transcript',
                    onClick: fn(),
                  },
          }),
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Copy transcript' });
    const link = await canvas.findByRole('link', { name: 'See all' });
    expect(link).toHaveAttribute('href', '/objects/callRecordings');
  },
};
