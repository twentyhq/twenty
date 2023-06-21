import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconArrowRight } from '@/ui/icons';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { IconButton } from '../IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'UI/Buttons/IconButton',
  component: IconButton,
};

export default meta;
type Story = StoryObj<typeof IconButton>;

const clickJestFn = jest.fn();

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <IconButton onClick={clickJestFn} icon={<IconArrowRight size={15} />} />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
