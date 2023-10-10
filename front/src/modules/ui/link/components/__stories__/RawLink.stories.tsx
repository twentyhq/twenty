import { Meta, StoryObj } from '@storybook/react';
import { expect, jest } from '@storybook/jest';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { RawLink } from '../RawLink';

const meta: Meta<typeof RawLink> = {
  title: 'UI/Links/RawLink',
  component: RawLink,
  decorators: [ComponentWithRouterDecorator],
  args: {
    className: 'RawLink',
    href: '/test',
    children: 'Raw Link',
  },

};

export default meta;
type Story = StoryObj<typeof RawLink>;
const clickJestFn = jest.fn();

export const Default: Story = {
    args: {
        onClick: clickJestFn
    }
};


