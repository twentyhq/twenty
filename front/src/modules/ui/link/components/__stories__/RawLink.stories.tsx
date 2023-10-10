import { expect } from '@storybook/jest';
import { jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

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
    onClick: clickJestFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(clickJestFn).toHaveBeenCalledTimes(0);
    const link = canvas.getByRole('link');
    await userEvent.click(link);

    await expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
