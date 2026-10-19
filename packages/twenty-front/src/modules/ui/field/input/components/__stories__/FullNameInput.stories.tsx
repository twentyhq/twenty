import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FullNameInput } from '@/ui/field/input/components/FullNameInput';

type FullNameInputWithValueProps = {
  initialValue: FieldFullNameValue;
  variant: 'floating' | 'inline';
};

const FullNameInputWithValue = ({
  initialValue,
  variant,
}: FullNameInputWithValueProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div style={{ width: 320 }}>
      <FullNameInput
        instanceId="full-name-input"
        variant={variant}
        value={value}
        placeholder="Full name"
        firstNamePlaceholder="First name"
        lastNamePlaceholder="Last name"
        onChange={setValue}
      />
    </div>
  );
};

const meta: Meta<typeof FullNameInputWithValue> = {
  title: 'UI/Data/Field/Input/FullNameInput',
  component: FullNameInputWithValue,
  args: {
    initialValue: { firstName: 'Mary Ann', lastName: 'Smith' },
    variant: 'floating',
  },
};

export default meta;
type Story = StoryObj<typeof FullNameInputWithValue>;

export const Floating: Story = {};

export const Inline: Story = {
  args: { variant: 'inline' },
};

export const NameDetailsOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Name details' }),
    );

    expect(
      await canvas.findByRole('textbox', { name: 'First name' }),
    ).toHaveValue('Mary Ann');
    expect(canvas.getByRole('textbox', { name: 'Last name' })).toHaveValue(
      'Smith',
    );
  },
};
