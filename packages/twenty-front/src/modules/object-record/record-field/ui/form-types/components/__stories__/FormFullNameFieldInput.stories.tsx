import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormFullNameFieldInput } from '@/object-record/record-field/ui/form-types/components/FormFullNameFieldInput';

const meta: Meta<typeof FormFullNameFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormFullNameFieldInput',
  component: FormFullNameFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
};

export default meta;

type Story = StoryObj<typeof FormFullNameFieldInput>;

export const Default: Story = {
  args: {
    label: 'Name',
    defaultValue: {
      firstName: 'John',
      lastName: 'Doe',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Name');
    await canvas.findByText('First Name');
    await canvas.findByText('Last Name');
  },
};

export const WithVariable: Story = {
  args: {
    label: 'Name',
    defaultValue: {
      firstName: `{{${MOCKED_STEP_ID}.name}}`,
      lastName: `{{${MOCKED_STEP_ID}.amount}}`,
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByText('Name');

    const lastNameVariable = await canvas.findByText('Amount');
    expect(lastNameVariable).toBeVisible();

    await canvas.findAllByText('VariablePicker');
  },
};

export const Disabled: Story = {
  args: {
    label: 'Name',
    readonly: true,
    defaultValue: {
      firstName: 'John',
      lastName: 'Doe',
    },
    VariablePicker: () => <div>VariablePicker</div>,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const firstNameVariable = await canvas.findByText('John');
    const lastNameVariable = await canvas.findByText('Doe');

    await userEvent.type(firstNameVariable, 'Jane');
    await userEvent.type(lastNameVariable, 'Smith');

    expect(args.onChange).not.toHaveBeenCalled();

    const variablePickers = canvas.queryAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(0);
  },
};
