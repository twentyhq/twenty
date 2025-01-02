import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { FormPhoneFieldInput } from '../FormPhoneFieldInput';

const meta: Meta<typeof FormPhoneFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormPhoneFieldInput',
  component: FormPhoneFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormPhoneFieldInput>;

const defaultPhoneValue: FieldPhonesValue = {
  primaryPhoneNumber: '0612345678',
  primaryPhoneCountryCode: 'FR',
  primaryPhoneCallingCode: '33',
};

export const Default: Story = {
  args: {
    label: 'Phone',
    defaultValue: defaultPhoneValue,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Phone');
  },
};
