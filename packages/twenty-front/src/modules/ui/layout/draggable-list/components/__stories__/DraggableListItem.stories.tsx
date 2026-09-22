import { LightIconButton } from 'twenty-ui/components';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { IconBell, IconMinus } from 'twenty-ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogDimension,
  type CatalogOptions,
  ComponentDecorator,
} from 'twenty-ui/testing';
import { DraggableListItem } from '@/ui/layout/draggable-list/components/DraggableListItem';

type RowColor = 'neutral' | 'danger';

const meta: Meta<typeof DraggableListItem> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemDraggable',
  component: DraggableListItem,
};

export default meta;

type Story = StoryObj<typeof DraggableListItem>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    icon: IconBell,
    color: 'neutral',
    actions: (
      <LightIconButton aria-label="Remove" onClick={action('Clicked')}>
        <IconMinus />
      </LightIconButton>
    ),
    onClick: action('Clicked'),
    children: 'Menu item draggable',
    dragDisabled: false,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args: { ...Default.args },
  argTypes: {
    color: { control: false },
    actions: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'] },
    catalog: {
      dimensions: [
        {
          name: 'iconContainer',
          values: [true, false],
          props: (iconContainer: boolean) => ({ iconContainer }),
          labels: (iconContainer: boolean) =>
            iconContainer ? 'With icon container' : 'Without icon container',
        },
        {
          name: 'dragDisabled',
          values: [true, false],
          props: (dragDisabled: boolean) => ({
            dragDisabled: dragDisabled,
          }),
          labels: (dragDisabled: boolean) =>
            dragDisabled ? 'Without drag icon' : 'With drag icon',
        },
        {
          name: 'colors',
          values: ['neutral', 'danger'] as RowColor[],
          props: (color: RowColor) => ({ color }),
        },
        {
          name: 'states',
          values: ['default', 'hover'],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
                return { className: state };
              default:
                return {};
            }
          },
        },
        {
          name: 'actions',
          values: ['no icon button', 'minus icon buttons'],
          props: (choice: string) => {
            switch (choice) {
              case 'no icon button': {
                return {
                  actions: null,
                };
              }
              case 'minus icon buttons': {
                return {
                  actions: (
                    <LightIconButton
                      aria-label="Remove"
                      onClick={action('Clicked on minus icon button')}
                    >
                      <IconMinus />
                    </LightIconButton>
                  ),
                };
              }
            }
          },
        },
      ] as CatalogDimension[],
      options: {
        elementContainer: {
          width: 200,
        },
      } as CatalogOptions,
    },
  },
  decorators: [CatalogDecorator],
};

export const Grip: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { ...Default.args, grip: 'always', dragDisabled: false },
};

export const GripOnHover: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { ...Default.args, grip: 'onHover', dragDisabled: false },
};

export const GripOnHoverWithIconContainer: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    ...Default.args,
    grip: 'onHover',
    iconContainer: true,
    dragDisabled: false,
  },
};

export const HoverDisabled: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { ...Default.args, dragDisabled: true },
};
