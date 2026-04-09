import { type Meta, type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';

import { FormCallingCodeSelectInput } from '@/object-record/record-field/ui/form-types/components/FormCallingCodeSelectInput';

const meta: Meta<typeof FormCallingCodeSelectInput> = {
  title: 'UI/Data/Field/Form/Input/FormCallingCodeSelectInput',
  component: FormCallingCodeSelectInput,
  args: {
    label: 'Calling Code',
  },
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormCallingCodeSelectInput>;

export const Default: Story = {
  args: {
    selectedCountryCode: 'FR',
    selectedCallingCode: '+33',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Calling Code');
  },
};
