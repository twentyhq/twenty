import { type Meta, type StoryObj } from '@storybook/react-vite';

import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink/RoundedLink';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof RoundedLink> = {
  title: 'UI/Navigation/Link/RoundedLink',
  component: RoundedLink,
  decorators: [ComponentDecorator],
  args: {
    href: '/test',
    label: 'Rounded chip',
  },
};

export default meta;
type Story = StoryObj<typeof RoundedLink>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {
    color: 'secondary',
  },
};
