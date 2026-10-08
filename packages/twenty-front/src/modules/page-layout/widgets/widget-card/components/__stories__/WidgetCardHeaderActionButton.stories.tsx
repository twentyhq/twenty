import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { IconPlus } from 'twenty-ui/icon';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';

const meta: Meta<typeof WidgetCardHeaderActionButton> = {
  title: 'Modules/PageLayout/Widgets/WidgetCardHeaderActionButton',
  component: WidgetCardHeaderActionButton,
  args: {
    Icon: IconPlus,
    label: 'New task',
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof WidgetCardHeaderActionButton>;

export const Catalog: CatalogStory<Story, typeof WidgetCardHeaderActionButton> =
  {
    decorators: [CatalogDecorator],
    parameters: {
      catalog: {
        dimensions: [
          {
            name: 'state',
            values: ['default', 'disabled'],
            props: (stateVariant: string) => ({
              disabled: stateVariant === 'disabled',
            }),
          },
        ],
      },
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      const buttons = await canvas.findAllByRole('button', {
        name: 'New task',
      });

      expect(buttons).toHaveLength(2);
      expect(buttons[1]).toBeDisabled();
    },
  };
