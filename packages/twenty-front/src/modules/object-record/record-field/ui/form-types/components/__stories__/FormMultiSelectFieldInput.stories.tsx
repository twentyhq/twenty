import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';

const meta: Meta<typeof FormMultiSelectFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormMultiSelectFieldInput',
  component: FormMultiSelectFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
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

export const WithVariablePicker: Story = {
  args: {
    label: 'Work Policy',
    defaultValue: ['WORK_POLICY_1', 'WORK_POLICY_2'],
    options: [
      {
        label: 'Work Policy 1',
        value: 'WORK_POLICY_1',
        color: 'blue',
      },
    ],
    onChange: fn(),
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
    onChange: fn(),
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
    defaultValue: `{{${MOCKED_STEP_ID}.stage}}`,
    onChange: fn(),
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const variableChip = await canvas.findByText('Stage');
    expect(variableChip).toBeVisible();

    await userEvent.click(variableChip);

    const searchInputInModal = canvas.queryByPlaceholderText('Search');
    expect(searchInputInModal).not.toBeInTheDocument();
  },
};
