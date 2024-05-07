import { Meta, StoryObj } from '@storybook/react';
import {
  Avatar,
  CatalogDecorator,
  CatalogDimension,
  CatalogOptions,
  CatalogStory,
  ComponentDecorator,
} from 'twenty-ui';

import { avatarUrl } from '~/testing/mock-data/users';

import { MenuItemMultiSelectAvatar } from '../MenuItemMultiSelectAvatar';

const meta: Meta<typeof MenuItemMultiSelectAvatar> = {
  title: 'UI/Navigation/MenuItem/MenuItemMultiSelectAvatar',
  component: MenuItemMultiSelectAvatar,
};

export default meta;

type Story = StoryObj<typeof MenuItemMultiSelectAvatar>;

export const Default: Story = {
  args: {
    text: 'First option',
    avatar: <Avatar avatarUrl={avatarUrl} placeholder="L" />,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItemMultiSelectAvatar> = {
  args: { text: 'Menu item' },
  argTypes: {
    className: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'withAvatar',
          values: [true, false],
          props: (withAvatar: boolean) => ({
            avatar: withAvatar ? (
              <Avatar avatarUrl={avatarUrl} placeholder="L" />
            ) : (
              <Avatar avatarUrl={''} placeholder="L" />
            ),
          }),
          labels: (withAvatar: boolean) =>
            withAvatar ? 'With avatar' : 'Without avatar',
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
