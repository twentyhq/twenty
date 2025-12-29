import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { FormCountrySelectInput } from '@/object-record/record-field/ui/form-types/components/FormCountrySelectInput';

const meta: Meta<typeof FormCountrySelectInput> = {
  title: 'UI/Data/Field/Form/Input/FormCountrySelectInput',
  component: FormCountrySelectInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormCountrySelectInput>;

export const Default: Story = {
  args: {
    label: 'Country',
    selectedCountryName: 'Canada',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Country');
    await canvas.findByText('Canada');
  },
};
