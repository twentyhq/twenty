import type { Meta, StoryObj } from '@storybook/react';

import { IconSearch } from '@/ui/icon';
import {
  CatalogDecorator,
  CatalogDimension,
} from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { MenuItemAccent } from '../../types/MenuItemAccent';
import { MenuItem, MenuItemIconButton } from '../MenuItem';

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
        Icon: IconSearch,
        onClick: () => {
          console.log('IconSearch clicked');
        },
      },
    ],
  },
};

export const Catalog: Story = {
  args: { LeftIcon: IconSearch, text: 'Menu item', iconButtons: [] },
  argTypes: {
    accent: { control: false },
    className: { control: false },
    iconButtons: { control: false },
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
          name: 'accents',
          values: ['default', 'danger'] satisfies MenuItemAccent[],
          props: (accent: MenuItemAccent) => ({ accent }),
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
          name: 'iconButtons',
          values: [
            [
              {
                Icon: IconSearch,
                onClick: () => console.log('Clicked on icon button'),
              },
            ],
            [
              {
                Icon: IconSearch,
                onClick: () => console.log('Clicked on first icon button'),
              },
              {
                Icon: IconSearch,
                onClick: () => console.log('Clicked on second icon button'),
              },
            ],
          ] satisfies MenuItemIconButton[][],
          props: (iconButtons: MenuItemIconButton[]) => {
            return { iconButtons };
          },
          labels: (iconButtons: MenuItemIconButton[]) => {
            if (iconButtons.length === 1) {
              return 'With icon button';
            } else if (iconButtons.length > 1) {
              return 'With icon button group';
            }
          },
        },
      ] as CatalogDimension[],
    },
  },
  decorators: [CatalogDecorator],
};
