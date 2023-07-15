import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconArrowRight } from '@/ui/icons';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { RoundedIconButton } from '../RoundedIconButton';

const meta: Meta<typeof RoundedIconButton> = {
  title: 'UI/Buttons/RoundedIconButton',
  component: RoundedIconButton,
};

export default meta;
type Story = StoryObj<typeof RoundedIconButton>;

const clickJestFn = jest.fn();

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <RoundedIconButton
      onClick={clickJestFn}
      icon={<IconArrowRight size={15} />}
    />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
