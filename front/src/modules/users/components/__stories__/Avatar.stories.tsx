import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { Avatar } from '../Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Modules/Users/Avatar',
  component: Avatar,
};

export default meta;
type Story = StoryObj<typeof Avatar>;

const avatarUrl =
  'https://s3-alpha-sig.figma.com/img/bbb5/4905/f0a52cc2b9aaeb0a82a360d478dae8bf?Expires=1687132800&Signature=iVBr0BADa3LHoFVGbwqO-wxC51n1o~ZyFD-w7nyTyFP4yB-Y6zFawL-igewaFf6PrlumCyMJThDLAAc-s-Cu35SBL8BjzLQ6HymzCXbrblUADMB208PnMAvc1EEUDq8TyryFjRO~GggLBk5yR0EXzZ3zenqnDEGEoQZR~TRqS~uDF-GwQB3eX~VdnuiU2iittWJkajIDmZtpN3yWtl4H630A3opQvBnVHZjXAL5YPkdh87-a-H~6FusWvvfJxfNC2ZzbrARzXofo8dUFtH7zUXGCC~eUk~hIuLbLuz024lFQOjiWq2VKyB7dQQuGFpM-OZQEV8tSfkViP8uzDLTaCg__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4';

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
