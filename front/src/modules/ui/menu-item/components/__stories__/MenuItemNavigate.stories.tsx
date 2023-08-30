import type { Meta, StoryObj } from '@storybook/react';

import { IconSearch } from '@/ui/icon';
import {
  CatalogDecorator,
  CatalogDimension,
} from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { MenuItemNavigate } from '../MenuItemNavigate';

const meta: Meta<typeof MenuItemNavigate> = {
  title: 'UI/MenuItem/MenuItemNavigate',
  component: MenuItemNavigate,
};

export default meta;

type Story = StoryObj<typeof MenuItemNavigate>;

export const Default: Story = {
  args: {
    text: 'First option',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args: { LeftIcon: IconSearch, text: 'Menu item' },
  argTypes: {
    className: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'withIcon',
          values: [true, false],
          props: (withIcon: boolean) => ({
            LeftIcon: withIcon ? IconSearch : undefined,
          }),
          labels: (withIcon: boolean) =>
            withIcon ? 'With left icon' : 'Without left icon',
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
      ] as CatalogDimension[],
    },
  },
  decorators: [CatalogDecorator],
};
