import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { Button, ButtonPosition } from '../Button';
import { ButtonGroup } from '../ButtonGroup';

const clickJestFn = jest.fn();

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/Button/ButtonGroup',
  component: ButtonGroup,
  decorators: [ComponentDecorator],
  argTypes: { children: { control: false } },
  args: {
    children: Object.values(ButtonPosition).map((position) => (
      <Button title={position} onClick={clickJestFn} />
    )),
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const leftButton = canvas.getByRole('button', { name: 'left' });

    const numberOfClicks = clickJestFn.mock.calls.length;
    await userEvent.click(leftButton);
    expect(clickJestFn).toHaveBeenCalledTimes(numberOfClicks + 1);
  },
};
