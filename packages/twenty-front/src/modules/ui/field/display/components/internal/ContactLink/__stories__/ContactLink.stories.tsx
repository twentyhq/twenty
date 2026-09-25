import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ContactLink } from '@/ui/field/display/components/internal/ContactLink/ContactLink';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const meta: Meta<typeof ContactLink> = {
  title: 'UI/Navigation/Link/ContactLink',
  component: ContactLink,
  decorators: [ComponentWithRouterDecorator],
  args: {
    href: '/test',
    children: 'Contact Link',
  },
};

export default meta;
type Story = StoryObj<typeof ContactLink>;
const clickJestFn = fn();

export const Email: Story = {
  args: {
    href: `mailto:${'email@example.com'}`,
    children: 'email@example.com',
    onClick: clickJestFn,
  },
};

export const Phone: Story = {
  args: {
    children: '11111111111',
    onClick: clickJestFn,
  },
};
