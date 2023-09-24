import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { RoundedLink } from '../RoundedLink';

const meta: Meta<typeof RoundedLink> = {
  title: 'UI/Links/RoundedLink',
  component: RoundedLink,
  decorators: [ComponentWithRouterDecorator],
  args: {
    href: '/test',
    children: 'Rounded chip',
  },
};

export default meta;
type Story = StoryObj<typeof RoundedLink>;

export const Default: Story = {};
