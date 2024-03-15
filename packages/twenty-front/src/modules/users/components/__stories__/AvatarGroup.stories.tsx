import { Meta, StoryObj } from '@storybook/react';

import {
  Avatar,
  AvatarProps,
  AvatarSize,
  AvatarType,
} from '@/users/components/Avatar';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { avatarUrl } from '~/testing/mock-data/users';

import { AvatarGroup, AvatarGroupProps } from '../AvatarGroup';

const makeAvatar = (userName: string, props: Partial<AvatarProps> = {}) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Avatar placeholder={userName} entityId={userName} {...props} />
);

const getAvatars = (commonProps: Partial<AvatarProps> = {}) => [
  makeAvatar('Matthew', { avatarUrl, ...commonProps }),
  makeAvatar('Sophie', commonProps),
  makeAvatar('Jane', commonProps),
  makeAvatar('Lily', commonProps),
  makeAvatar('John', commonProps),
];

const meta: Meta<
  AvatarGroupProps & AvatarProps & { numberOfAvatars?: number }
> = {
  title: 'Modules/Users/AvatarGroup',
  component: AvatarGroup,
  render: ({ numberOfAvatars = 5, ...args }) => (
    <AvatarGroup avatars={getAvatars(args).slice(0, numberOfAvatars)} />
  ),
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'number of avatars',
          values: [1, 2, 3, 4, 5],
          props: (numberOfAvatars: number) => ({ numberOfAvatars }),
        },
        {
          name: 'types',
          values: ['rounded', 'squared'] as AvatarType[],
          props: (type: AvatarType) => ({ type }),
        },
        {
          name: 'sizes',
          values: ['xs', 'sm', 'md', 'lg', 'xl'] as AvatarSize[],
          props: (size: AvatarSize) => ({ size }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
