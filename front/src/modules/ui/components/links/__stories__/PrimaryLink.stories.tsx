import { MemoryRouter } from 'react-router-dom';
import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { PrimaryLink } from '../PrimaryLink';

const meta: Meta<typeof PrimaryLink> = {
  title: 'UI/Links/PrimaryLink',
  component: PrimaryLink,
};

export default meta;
type Story = StoryObj<typeof PrimaryLink>;

const clickJestFn = jest.fn();

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <MemoryRouter>
      <PrimaryLink href="/test" onClick={clickJestFn}>
        A primary link
      </PrimaryLink>
    </MemoryRouter>,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const link = canvas.getByRole('link');
    await userEvent.click(link);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
