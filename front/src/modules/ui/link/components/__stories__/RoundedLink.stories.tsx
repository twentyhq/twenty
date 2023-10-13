import { expect } from '@storybook/jest';
import { jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

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
