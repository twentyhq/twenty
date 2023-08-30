import type { Meta, StoryObj } from '@storybook/react';

import { IconSearch } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { MenuItem } from '../MenuItem';

const meta: Meta<typeof MenuItem> = {
  title: 'UI/MenuItem/MenuItem',
  component: MenuItem,
};

export default meta;

type Story = StoryObj<typeof MenuItem>;

export const Default: Story = {
  args: {
    text: 'Menu item text',
  },
  decorators: [ComponentDecorator],
};

export const WithIconButtons: Story = {
  ...Default,
  args: {
    ...Default.args,
    iconButtons: [
      {
        icon: IconSearch,
        onClick: () => {
          console.log('IconSearch clicked');
        },
      },
    ],
  },
};

export const Catalog: Story = {
  args: { LeftIcon: IconSearch, text: 'Menu item' },
  argTypes: {},
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
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
      ],
    },
  },
  decorators: [CatalogDecorator],
};
