import { Meta, StoryObj } from '@storybook/react';

import { IconBell } from '@/ui/icon';
import {
  CatalogDecorator,
  CatalogDimension,
  CatalogOptions,
} from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { MenuItemCommand } from '../MenuItemCommand';

const meta: Meta<typeof MenuItemCommand> = {
  title: 'UI/MenuItem/MenuItemCommand',
  component: MenuItemCommand,
};

export default meta;

type Story = StoryObj<typeof MenuItemCommand>;

export const Default: Story = {
  args: {
    text: 'First option',
    command: '⌘ 1',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args: { LeftIcon: IconBell, text: 'Menu item', command: '⌘1' },
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
            LeftIcon: withIcon ? IconBell : undefined,
          }),
          labels: (withIcon: boolean) =>
            withIcon ? 'With left icon' : 'Without left icon',
        },
        {
          name: 'selected',
          values: [true, false],
          props: (selected: boolean) => ({ selected }),
          labels: (selected: boolean) =>
            selected ? 'Selected' : 'Not selected',
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
      options: {
        elementContainer: {
          width: 200,
        },
      } as CatalogOptions,
    },
  },
  decorators: [CatalogDecorator],
};
