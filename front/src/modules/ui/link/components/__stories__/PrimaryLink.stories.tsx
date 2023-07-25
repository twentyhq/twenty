import { MemoryRouter } from 'react-router-dom';
import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { PrimaryLink } from '../PrimaryLink';

const meta: Meta<typeof PrimaryLink> = {
  title: 'UI/Links/PrimaryLink',
  component: PrimaryLink,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof PrimaryLink>;

const clickJestFn = jest.fn();

export const Default: Story = {
  args: { href: '/test', onClick: clickJestFn, children: 'A primary link' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const link = canvas.getByRole('link');
    await userEvent.click(link);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
