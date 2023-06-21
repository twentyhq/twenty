import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconBrandGoogle } from '@/ui/icons';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { SecondaryButton } from '../SecondaryButton';

const meta: Meta<typeof SecondaryButton> = {
  title: 'UI/Buttons/SecondaryButton',
  component: SecondaryButton,
};

export default meta;
type Story = StoryObj<typeof SecondaryButton>;

const clickJestFn = jest.fn();

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <SecondaryButton onClick={clickJestFn}>A Primary Button</SecondaryButton>,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};

export const WithIcon: Story = {
  render: getRenderWrapperForComponent(
    <SecondaryButton>
      <IconBrandGoogle size={16} stroke={4} />A Primary Button
    </SecondaryButton>,
  ),
};

export const FullWidth: Story = {
  render: getRenderWrapperForComponent(
    <SecondaryButton fullWidth={true}>A Primary Button</SecondaryButton>,
  ),
};
