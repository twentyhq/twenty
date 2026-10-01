import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Input } from 'twenty-ui/primitives/input';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';

const meta: Meta<typeof FormMultiSelectFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormMultiSelectFieldInput',
  component: FormMultiSelectFieldInput,
  args: { onChange: fn() },
  argTypes: {},
  decorators: [WorkflowStepDecorator],
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

export const ToggleAndDismiss: Story = {
  args: Default.args,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Work Policy' });

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Work Policy' });
    const picker = within(popup);

    await userEvent.type(picker.getByRole('searchbox'), 'Policy 3{Enter}');
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith([
        'WORK_POLICY_3',
        'WORK_POLICY_1',
        'WORK_POLICY_2',
      ]);
    });
    expect(popup).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(
      await body.findByRole('dialog', { name: 'Work Policy' }),
    ).toBeVisible();
    expect(body.getByRole('searchbox')).toHaveValue('');
    expect(
      within(body.getByRole('dialog')).getByRole('button', {
        name: 'Work Policy 3',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  },
};

export const OutsideInputThenTab: Story = {
  args: Default.args,
  decorators: [
    (Story) => (
      <>
        <Story />
        <Input aria-label="Outside input" />
      </>
    ),
  ],
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(body.getByRole('button', { name: 'Work Policy' }));
    const popup = await body.findByRole('dialog', { name: 'Work Policy' });
    await userEvent.click(body.getByRole('textbox', { name: 'Outside input' }));
    expect(popup).toBeVisible();
    await userEvent.click(within(popup).getByRole('searchbox'));
    await userEvent.tab();

    await waitFor(() => {
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
      expect(
        body.getByRole('textbox', { name: 'Outside input' }),
      ).toHaveFocus();
    });
  },
};
