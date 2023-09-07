import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconBrandGoogle } from '@/ui/icon';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { MainButton } from '../MainButton';

const clickJestFn = jest.fn();

const meta: Meta<typeof MainButton> = {
  title: 'UI/Button/MainButton',
  component: MainButton,
  decorators: [ComponentDecorator],
  args: { title: 'A primary Button', onClick: clickJestFn },
};

export default meta;
type Story = StoryObj<typeof MainButton>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};

export const WithIcon: Story = {
  args: { Icon: IconBrandGoogle, iconProps: { size: 16, stroke: 4 } },
};

export const DisabledWithIcon: Story = {
  args: { ...WithIcon.args, disabled: true },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
};

export const Secondary: Story = {
  args: { title: 'A secondary Button', variant: 'secondary' },
};

export const SecondaryWithIcon: Story = {
  args: { ...Secondary.args, ...WithIcon.args },
};

export const SecondaryDisabledWithIcon: Story = {
  args: { ...SecondaryWithIcon.args, disabled: true },
};

export const SecondaryFullWidth: Story = {
  args: { ...Secondary.args, ...FullWidth.args },
};
