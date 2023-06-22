import { expect } from '@storybook/jest';
import { jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { TextInput } from '../TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'UI/Inputs/TextInput',
  component: TextInput,
};

export default meta;
type Story = StoryObj<typeof TextInput>;

const changeJestFn = jest.fn();

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <TextInput value="A good value " onChange={changeJestFn} />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox');
    await userEvent.type(input, 'cou', { delay: 100 });

    expect(changeJestFn).toHaveBeenNthCalledWith(1, 'A good value c');
    expect(changeJestFn).toHaveBeenNthCalledWith(2, 'A good value co');
    expect(changeJestFn).toHaveBeenNthCalledWith(3, 'A good value cou');
  },
};

export const Placeholder: Story = {
  render: getRenderWrapperForComponent(
    <TextInput value="" onChange={changeJestFn} placeholder="Placeholder" />,
  ),
};

export const FullWidth: Story = {
  render: getRenderWrapperForComponent(
    <TextInput
      value="A good value"
      onChange={changeJestFn}
      placeholder="Placeholder"
      fullWidth
    />,
  ),
};
