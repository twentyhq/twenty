import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { Avatar } from '../Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Modules/Users/Avatar',
  component: Avatar,
};

export default meta;
type Story = StoryObj<typeof Avatar>;

const avatarUrl = 'http://placekitten.com/300/300';

export const Rounded: Story = {
  render: getRenderWrapperForComponent(
    <Avatar avatarUrl={avatarUrl} size={16} placeholder="L" type="rounded" />,
  ),
};

export const Squared: Story = {
  render: getRenderWrapperForComponent(
    <Avatar avatarUrl={avatarUrl} size={16} placeholder="L" type="squared" />,
  ),
};

export const NoAvatarPictureRounded: Story = {
  render: getRenderWrapperForComponent(
    <Avatar avatarUrl={''} size={16} placeholder="L" type="rounded" />,
  ),
};

export const NoAvatarPictureSquared: Story = {
  render: getRenderWrapperForComponent(
    <Avatar avatarUrl={''} size={16} placeholder="L" type="squared" />,
  ),
};
