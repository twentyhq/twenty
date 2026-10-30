import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { EmailAlignmentInput } from '@/side-panel/pages/email-block-settings/components/EmailAlignmentInput';

const ControlledEmailAlignmentInput = ({
  initialValue,
  onChange,
}: {
  initialValue: string;
  onChange: (value: string) => void;
}) => {
  const [value, setValue] = useState(initialValue);

  return (
    <EmailAlignmentInput
      label="Alignment"
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
    />
  );
};

const meta: Meta<typeof ControlledEmailAlignmentInput> = {
  title: 'Modules/SidePanel/EmailBlockSettings/EmailAlignmentInput',
  component: ControlledEmailAlignmentInput,
  decorators: [ComponentDecorator],
  args: { initialValue: 'left', onChange: fn() },
};

export default meta;
type Story = StoryObj<typeof ControlledEmailAlignmentInput>;

export const KeyboardSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = await canvas.findByRole('radiogroup', { name: 'Alignment' });
    const left = within(group).getByRole('radio', { name: 'Align left' });
    const center = within(group).getByRole('radio', { name: 'Align center' });

    expect(left).toBeChecked();

    await userEvent.tab();
    expect(left).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(center).toBeChecked());
    expect(center).toHaveFocus();
    expect(args.onChange).toHaveBeenLastCalledWith('center');

    await userEvent.click(
      within(group).getByRole('radio', { name: 'Align right' }),
    );
    expect(args.onChange).toHaveBeenLastCalledWith('right');
  },
};

export const WithoutValue: Story = {
  args: { initialValue: '' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = await canvas.findAllByRole('radio');

    expect(radios).toHaveLength(3);

    for (const radio of radios) {
      expect(radio).not.toBeChecked();
    }
  },
};
