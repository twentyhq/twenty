import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { LargeMainButton } from '@/ui/input/button/components/LargeMainButton.tsx';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

const clickJestFn = fn();

const meta: Meta<typeof LargeMainButton> = {
  title: 'UI/Input/Button/LargeMainButton',
  component: LargeMainButton,
  decorators: [ComponentDecorator],
  args: { title: 'A primary Button', onClick: clickJestFn },
};

export default meta;
type Story = StoryObj<typeof LargeMainButton>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
