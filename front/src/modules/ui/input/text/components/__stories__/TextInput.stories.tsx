import { useState } from 'react';
import { expect } from '@storybook/jest';
import { jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { TextInputSettings } from '../TextInputSettings';

const changeJestFn = jest.fn();

const meta: Meta<typeof TextInputSettings> = {
  title: 'UI/Input/TextInput',
  component: TextInputSettings,
  decorators: [ComponentDecorator],
  args: { value: '', onChange: changeJestFn, placeholder: 'Placeholder' },
};

export default meta;
type Story = StoryObj<typeof TextInputSettings>;

const FakeTextInput = ({
  onChange,
  value: initialValue,
  ...props
}: React.ComponentProps<typeof TextInputSettings>) => {
  const [value, setValue] = useState(initialValue);
  return (
    <TextInputSettings
      // eslint-disable-next-line twenty/no-spread-props
      {...props}
      value={value}
      onChange={(text) => {
        setValue(text);
        onChange?.(text);
      }}
    />
  );
};

export const Default: Story = {
  argTypes: { value: { control: false } },
  args: { value: 'A good value ' },
  // eslint-disable-next-line twenty/no-spread-props
  render: (args) => <FakeTextInput {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox');
    await userEvent.type(input, 'cou', { delay: 100 });

    expect(changeJestFn).toHaveBeenNthCalledWith(1, 'A good value c');
    expect(changeJestFn).toHaveBeenNthCalledWith(2, 'A good value co');
    expect(changeJestFn).toHaveBeenNthCalledWith(3, 'A good value cou');
  },
};

export const Placeholder: Story = {};

export const FullWidth: Story = {
  args: { value: 'A good value', fullWidth: true },
};

export const WithLabel: Story = {
  args: { label: 'Lorem ipsum' },
};

export const WithError: Story = {
  args: { error: 'Lorem ipsum' },
};

export const PasswordInput: Story = {
  args: { type: 'password', placeholder: 'Password' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByPlaceholderText('Password');
    await userEvent.type(input, 'pa$$w0rd');

    const revealButton = canvas.getByTestId('reveal-password-button');
    await userEvent.click(revealButton);

    expect(input).toHaveAttribute('type', 'text');
  },
};
