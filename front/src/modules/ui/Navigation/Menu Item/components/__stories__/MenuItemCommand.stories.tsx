import { Meta, StoryObj } from '@storybook/react';
import { Command } from 'cmdk';

import { IconBell } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { CatalogStory } from '~/testing/types';

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
  render: (props) => (
    <Command>
      <MenuItemCommand
        LeftIcon={props.LeftIcon}
        text={props.text}
        command={props.text}
        className={props.className}
        onClick={props.onClick}
      ></MenuItemCommand>
    </Command>
  ),
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItemCommand> = {
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
          props: () => ({}),
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
      ],
      options: {
        elementContainer: {
          width: 200,
        },
      },
    },
  },
  render: (props) => (
    <Command>
      <MenuItemCommand
        LeftIcon={props.LeftIcon}
        text={props.text}
        command={props.text}
        className={props.className}
        onClick={props.onClick}
      ></MenuItemCommand>
    </Command>
  ),
  decorators: [CatalogDecorator],
};
