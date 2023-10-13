import { jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { ContactLink } from '../ContactLink';

const meta: Meta<typeof ContactLink> = {
  title: 'UI/Links/ContactLink',
  component: ContactLink,
  decorators: [ComponentWithRouterDecorator],
  args: {
    className: 'ContactLink',
    href: '/test',
    children: 'Contact Link',
  },
};

export default meta;
type Story = StoryObj<typeof ContactLink>;
const clickJestFn = jest.fn();

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
