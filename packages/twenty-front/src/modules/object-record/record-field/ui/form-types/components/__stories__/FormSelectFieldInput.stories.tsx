import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';

const meta: Meta<typeof FormSelectFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormSelectFieldInput',
  component: FormSelectFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator],
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

    const label = await canvas.findByText('Work Policy');
    expect(label).toBeVisible();

    const selectControl = await canvas.findByText('Work Policy 1');
    expect(selectControl).toBeVisible();
  },
};

export const Nullable: Story = {
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
    ],
    onChange: fn(),
    isNullable: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const selectControl = await canvas.findByText('Work Policy 1');
    await userEvent.click(selectControl);

    const dropdown = within(canvasElement.ownerDocument.body);

    await waitFor(() => {
      expect(dropdown.getByText('No Work Policy')).toBeVisible();
    });

    await userEvent.click(dropdown.getByText('No Work Policy'));

    expect(args.onChange).toHaveBeenCalledWith(null);
  },
};

export const NonNullable: Story = {
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
    ],
    onChange: fn(),
    isNullable: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const selectControl = await canvas.findByText('Work Policy 1');
    await userEvent.click(selectControl);

    const dropdown = within(canvasElement.ownerDocument.body);

    await waitFor(() => {
      expect(dropdown.getByText('Work Policy 2')).toBeVisible();
    });

    expect(dropdown.queryByText('No Work Policy')).not.toBeInTheDocument();
  },
};

export const NoOptionsWithCallToAction: Story = {
  args: {
    label: 'Work Policy',
    defaultValue: undefined,
    options: [],
    onChange: fn(),
    callToActionButton: {
      text: 'Add work policy',
      onClick: fn(),
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const selectControl = await canvas.findByText('No Work Policy');
    expect(selectControl).toBeVisible();

    await userEvent.click(selectControl);

    const dropdown = within(canvasElement.ownerDocument.body);

    await waitFor(() => {
      expect(dropdown.getByText('Add work policy')).toBeVisible();
    });

    await userEvent.click(dropdown.getByText('Add work policy'));

    expect(args.callToActionButton?.onClick).toHaveBeenCalled();
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
    defaultValue: `{{${MOCKED_STEP_ID}.createdAt}}`,
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

    const variableChip = await canvas.findByText('Creation date');
    expect(variableChip).toBeVisible();

    await userEvent.click(variableChip);

    const searchInputInModal = canvas.queryByPlaceholderText('Search');
    expect(searchInputInModal).not.toBeInTheDocument();
  },
};
