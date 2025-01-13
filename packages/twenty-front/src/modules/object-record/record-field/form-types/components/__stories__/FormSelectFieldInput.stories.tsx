import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';
import { FormSelectFieldInput } from '../FormSelectFieldInput';

const meta: Meta<typeof FormSelectFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormSelectFieldInput',
  component: FormSelectFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormSelectFieldInput>;

export const Default: Story = {
  args: {
    label: 'Work Policy',
    defaultValue: 'WORK_POLICY_1',
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

    const selectedOption = await canvas.findByText('Work Policy');

    expect(selectedOption).toBeVisible();
  },
};

export const WithVariablePicker: Story = {
  args: {
    label: 'Work Policy',
    defaultValue: 'WORK_POLICY_1',
    options: [
      {
        label: 'Work Policy 1',
        value: 'WORK_POLICY_1',
        color: 'blue',
      },
    ],
    onPersist: fn(),
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const firstChip = await canvas.findByText('Work Policy 1');
    expect(firstChip).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    label: 'Work Policy',
    defaultValue: 'WORK_POLICY_1',
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
    onPersist: fn(),
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const firstChip = await canvas.findByText('Work Policy 1');
    expect(firstChip).toBeVisible();

    await userEvent.click(firstChip);

    const searchInputInModal = canvas.queryByPlaceholderText('Search');
    expect(searchInputInModal).not.toBeInTheDocument();
  },
};

export const DisabledWithVariable: Story = {
  args: {
    label: 'Created At',
    defaultValue: `{{a.b.c}}`,
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
    onPersist: fn(),
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const variableChip = await canvas.findByText('c');
    expect(variableChip).toBeVisible();

    await userEvent.click(variableChip);

    const searchInputInModal = canvas.queryByPlaceholderText('Search');
    expect(searchInputInModal).not.toBeInTheDocument();
  },
};
