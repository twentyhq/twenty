import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import NavCollapseButton from '../components/NavCollapseButton';

const meta: Meta<typeof NavCollapseButton> = {
  title: 'UI/Navbar/NavCollapseButton',
  component: NavCollapseButton,
};

export default meta;
type Story = StoryObj<typeof NavCollapseButton>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const Hidden: Story = {
  args: { show: false },
  decorators: [ComponentDecorator],
};
