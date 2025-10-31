import { DateFormat } from '@/localization/constants/DateFormat';
import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';

import { type Meta, type StoryObj } from '@storybook/react';
import {
  expect,
  fn,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@storybook/test';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { getDateFormatStringForDatePickerInputMask } from '~/utils/date-utils';

// TODO: review formatting, placeholder and date format when refactoring FormInputs with other date pickers in the app.
const meta: Meta<typeof FormDateFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormDateFieldInput',
  component: FormDateFieldInput,
  args: {},
  argTypes: {},
  decorators: [I18nFrontDecorator, WorkflowStepDecorator],
};

export default meta;

type Story = StoryObj<typeof FormDateFieldInput>;

const currentYear = new Date().getFullYear();

const formatPlaceholder = getDateFormatStringForDatePickerInputMask(
  DateFormat.MONTH_FIRST,
);

export const Default: Story = {
  args: {
    label: 'Created At',
    defaultValue: `${currentYear}-09-12`,
    placeholder: formatPlaceholder,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Created At');
    await canvas.findByDisplayValue('09/12/' + currentYear);
  },
};

export const WithDefaultEmptyValue: Story = {
  args: {
    label: 'Created At',
    defaultValue: undefined,
    placeholder: formatPlaceholder,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Created At');
    await canvas.findByDisplayValue('');
    await canvas.findByPlaceholderText(formatPlaceholder);
  },
};

export const SetsDateWithInput: Story = {
  args: {
    label: 'Created At',
    defaultValue: undefined,
    onChange: fn(),
    placeholder: formatPlaceholder,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText(formatPlaceholder);

    await userEvent.click(input);

    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeVisible();

    await userEvent.type(input, `12/08/${currentYear}{enter}`);

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(`${currentYear}-08-12`);
    });

    expect(dialog).toBeVisible();
  },
};

export const SetsDateWithDatePicker: Story = {
  args: {
    label: 'Created At',
    defaultValue: `2024-12-09`,
    onChange: fn(),
    placeholder: formatPlaceholder,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText(formatPlaceholder);
    expect(input).toBeVisible();

    await userEvent.click(input);

    const datePicker = await canvas.findByRole('dialog');
    expect(datePicker).toBeVisible();

    const dayToChoose = await within(datePicker).findByRole('option', {
      name: `Choose Saturday, December 7th, 2024`,
    });

    await Promise.all([
      userEvent.click(dayToChoose),

      waitForElementToBeRemoved(datePicker),
      waitFor(() => {
        expect(args.onChange).toHaveBeenCalledWith(
          expect.stringMatching(new RegExp(`^2024-12-07`)),
        );
      }),
      waitFor(() => {
        expect(canvas.getByDisplayValue(`07/12/2024`)).toBeVisible();
      }),
    ]);
  },
};

export const ResetsDateByClickingButton: Story = {
  args: {
    label: 'Created At',
    defaultValue: `${currentYear}-12-09`,
    onChange: fn(),
    placeholder: formatPlaceholder,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText(formatPlaceholder);
    expect(input).toBeVisible();

    await userEvent.click(input);

    const datePicker = await canvas.findByRole('dialog');
    expect(datePicker).toBeVisible();

    const clearButton = await canvas.findByText('Clear');

    await Promise.all([
      userEvent.click(clearButton),

      waitForElementToBeRemoved(datePicker),
      waitFor(() => {
        expect(args.onChange).toHaveBeenCalledWith(null);
      }),
      waitFor(() => {
        expect(input).toHaveDisplayValue('');
      }),
    ]);
  },
};

export const ResetsDateByErasingInputContent: Story = {
  args: {
    label: 'Created At',
    defaultValue: `${currentYear}-09-12`,
    onChange: fn(),
    placeholder: formatPlaceholder,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText(formatPlaceholder);
    expect(input).toBeVisible();

    expect(input).toHaveDisplayValue(`12/09/${currentYear}`);

    await userEvent.clear(input);

    await userEvent.type(input, '{Enter}');

    expect(args.onChange).toHaveBeenCalledWith(null);
    expect(input).toHaveDisplayValue('');
  },
};

export const SwitchesToStandaloneVariable: Story = {
  args: {
    label: 'Created At',
    defaultValue: undefined,
    onChange: fn(),
    placeholder: formatPlaceholder,
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect(`{{${MOCKED_STEP_ID}.createdAt}}`);
          }}
        >
          Add variable
        </button>
      );
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addVariableButton = await canvas.findByText('Add variable');
    await userEvent.click(addVariableButton);

    const variableTag = await canvas.findByText('Creation date');
    expect(variableTag).toBeVisible();

    const removeVariableButton = canvas.getByLabelText('Remove variable');

    await Promise.all([
      userEvent.click(removeVariableButton),

      waitForElementToBeRemoved(variableTag),
      waitFor(() => {
        const input = canvas.getByPlaceholderText(formatPlaceholder);
        expect(input).toBeVisible();
      }),
    ]);
  },
};

export const ClickingOutsideDoesNotResetInputState: Story = {
  args: {
    label: 'Created At',
    placeholder: formatPlaceholder,
    defaultValue: `${currentYear}-12-09`,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    if (!args.defaultValue) {
      throw new Error('This test requires a defaultValue');
    }

    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText(formatPlaceholder);
    expect(input).toBeVisible();

    await userEvent.type(input, '{Backspace}{Backspace}');

    const datePicker = await canvas.findByRole('dialog');
    expect(datePicker).toBeVisible();

    await Promise.all([
      userEvent.click(canvasElement),

      waitForElementToBeRemoved(datePicker),
    ]);

    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: {
    label: 'Created At',
    placeholder: formatPlaceholder,
    defaultValue: `${currentYear}-09-12`,
    onChange: fn(),
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByDisplayValue('12/09/' + currentYear);
    expect(input).toBeDisabled();
  },
};

export const DisabledWithVariable: Story = {
  args: {
    label: 'Created At',
    placeholder: formatPlaceholder,
    defaultValue: `{{${MOCKED_STEP_ID}.createdAt}}`,
    onChange: fn(),
    readonly: true,
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect(`{{${MOCKED_STEP_ID}.createdAt}}`);
          }}
        >
          Add variable
        </button>
      );
    },
  },
  decorators: [WorkflowStepDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const variableChip = await canvas.findByText('Creation date');
    expect(variableChip).toBeVisible();
  },
};
