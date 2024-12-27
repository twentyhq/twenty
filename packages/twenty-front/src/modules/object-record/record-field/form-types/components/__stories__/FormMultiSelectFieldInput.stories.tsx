import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { FormMultiSelectFieldInput } from '../FormMultiSelectFieldInput';

const meta: Meta<typeof FormMultiSelectFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormMultiSelectFieldInput',
  component: FormMultiSelectFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormMultiSelectFieldInput>;

export const Default: Story = {
  args: {
    label: 'Work Policy',
    defaultValue: ['WORK_POLICY_1', 'WORK_POLICY_2'],
    options: [
      {
        label: 'Work Policy 1',
        value: 'WORK_POLICY_1',
        color: 'blue',
      },
      {
        label: 'Work Policy 2',
        value: 'WORK_POLICY_2',
        color: 'green',
      },
      {
        label: 'Work Policy 3',
        value: 'WORK_POLICY_3',
        color: 'red',
      },
      {
        label: 'Work Policy 4',
        value: 'WORK_POLICY_4',
        color: 'yellow',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Work Policy');
    await canvas.findByText('Work Policy 1');
    await canvas.findByText('Work Policy 2');
  },
};
