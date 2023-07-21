import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconArrowRight } from '@/ui/icon';
import { ComponentDecorator } from '~/testing/decorators';

import { RoundedIconButton } from '../RoundedIconButton';

const clickJestFn = jest.fn();

const meta: Meta<typeof RoundedIconButton> = {
  title: 'UI/Button/RoundedIconButton',
  component: RoundedIconButton,
  decorators: [ComponentDecorator],
  args: { onClick: clickJestFn, icon: <IconArrowRight size={15} /> },
};

export default meta;
type Story = StoryObj<typeof RoundedIconButton>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
