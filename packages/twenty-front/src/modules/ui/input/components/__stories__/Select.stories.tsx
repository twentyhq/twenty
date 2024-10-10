import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';

import { Select, SelectProps } from '../Select';
import { IconPlus } from 'packages/twenty-ui';

type RenderProps = SelectProps<string | number | null>;

const Render = (args: RenderProps) => {
  const [value, setValue] = useState(args.value);
  const handleChange = (value: string | number | null) => {
    args.onChange?.(value);
    setValue(value);
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Select {...args} value={value} onChange={handleChange} />;
};

const meta: Meta<typeof Select> = {
  title: 'UI/Input/Select',
  component: Select,
  decorators: [ComponentDecorator],
  args: {
    dropdownId: 'select',
    value: 'a',
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
      { value: 'c', label: 'Option C' },
    ],
  },
  render: Render,
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const selectLabel = await canvas.getByText('Option A');

    await userEvent.click(selectLabel);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithSearch: Story = {
  args: { withSearchInput: true },
};

export const CallToActionButton: Story = {
  args: {
    callToActionButton: {
      onClick: () => {},
      Icon: IconPlus,
      text: 'Add action',
    },
  },
};
