import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconBrandGoogle } from '@/ui/icons';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { PrimaryButton } from '../PrimaryButton';

const meta: Meta<typeof PrimaryButton> = {
  title: 'UI/Buttons/PrimaryButton',
  component: PrimaryButton,
};

export default meta;
type Story = StoryObj<typeof PrimaryButton>;

const clickJestFn = jest.fn();

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <PrimaryButton onClick={clickJestFn}>A Primary Button</PrimaryButton>,
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
    <PrimaryButton>
      <IconBrandGoogle size={16} stroke={4} />A Primary Button
    </PrimaryButton>,
  ),
};

export const FullWidth: Story = {
  render: getRenderWrapperForComponent(
    <PrimaryButton fullWidth={true}>A Primary Button</PrimaryButton>,
  ),
};
