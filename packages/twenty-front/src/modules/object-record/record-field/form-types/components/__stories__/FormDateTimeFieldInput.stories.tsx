import { FormDateTimeFieldInput } from '@/object-record/record-field/form-types/components/FormDateTimeFieldInput';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { parseDateToString } from '@/ui/input/components/internal/date/utils/parseDateToString';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import {
  fn,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@storybook/test';
import { DateTime } from 'luxon';

const meta: Meta<typeof FormDateTimeFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormDateTimeFieldInput',
  component: FormDateTimeFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormDateTimeFieldInput>;

const currentYear = new Date().getFullYear();

export const Default: Story = {
  args: {
    label: 'Created At',
    defaultValue: `${currentYear}-12-09T13:20:19.631Z`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Created At');
    await canvas.findByDisplayValue(
      new RegExp(`12/09/${currentYear} \\d{2}:20`),
    );
  },
};

export const WithDefaultEmptyValue: Story = {
  args: {
    label: 'Created At',
    defaultValue: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Created At');
    await canvas.findByDisplayValue('');
    await canvas.findByPlaceholderText('mm/dd/yyyy hh:mm');
  },
};

export const SetsDateTimeWithInput: Story = {
  args: {
    label: 'Created At',
    defaultValue: undefined,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy hh:mm');

    await userEvent.click(input);

    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeVisible();

    await userEvent.type(input, `12/08/${currentYear} 12:10{enter}`);

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^${currentYear}-12-08`)),
      );
    });

    expect(dialog).toBeVisible();
  },
};

export const DoesNotSetDateWithoutTime: Story = {
  args: {
    label: 'Created At',
    defaultValue: undefined,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy hh:mm');

    await userEvent.click(input);

    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeVisible();

    await userEvent.type(input, `12/08/${currentYear}{enter}`);

    expect(args.onPersist).not.toHaveBeenCalled();
    expect(dialog).toBeVisible();
  },
};

export const SetsDateTimeWithDatePicker: Story = {
  args: {
    label: 'Created At',
    defaultValue: `2024-12-09T13:20:19.631Z`,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy hh:mm');
    expect(input).toBeVisible();

    await userEvent.click(input);

    const datePicker = await canvas.findByRole('dialog');
    expect(datePicker).toBeVisible();

    const dayToChoose = await within(datePicker).findByRole('option', {
      name: 'Choose Saturday, December 7th, 2024',
    });

    await Promise.all([
      userEvent.click(dayToChoose),

      waitForElementToBeRemoved(datePicker),
      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(
          expect.stringMatching(/^2024-12-07/),
        );
      }),
      waitFor(() => {
        expect(
          canvas.getByDisplayValue(new RegExp(`12/07/2024 \\d{2}:\\d{2}`)),
        ).toBeVisible();
      }),
    ]);
  },
};

export const ResetsDateByClickingButton: Story = {
  args: {
    label: 'Created At',
    defaultValue: `${currentYear}-12-09T13:20:19.631Z`,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy hh:mm');
    expect(input).toBeVisible();

    await userEvent.click(input);

    const datePicker = await canvas.findByRole('dialog');
    expect(datePicker).toBeVisible();

    const clearButton = await canvas.findByText('Clear');

    await Promise.all([
      userEvent.click(clearButton),

      waitForElementToBeRemoved(datePicker),
      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(null);
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
    defaultValue: `${currentYear}-12-09T13:20:19.631Z`,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy hh:mm');
    expect(input).toBeVisible();

    expect(input).toHaveDisplayValue(
      new RegExp(`12/09/${currentYear} \\d{2}:\\d{2}`),
    );

    await userEvent.clear(input);

    await Promise.all([
      userEvent.type(input, '{Enter}'),

      waitForElementToBeRemoved(() => canvas.queryByRole('dialog')),
      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(null);
      }),
      waitFor(() => {
        expect(input).toHaveDisplayValue('');
      }),
    ]);
  },
};

export const DefaultsToMinValueWhenTypingReallyOldDate: Story = {
  args: {
    label: 'Created At',
    defaultValue: undefined,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy hh:mm');
    expect(input).toBeVisible();

    await userEvent.click(input);

    const datePicker = await canvas.findByRole('dialog');
    expect(datePicker).toBeVisible();

    await Promise.all([
      userEvent.type(input, '02/02/1500 10:10{Enter}'),

      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(MIN_DATE.toISOString());
      }),
      waitFor(() => {
        expect(input).toHaveDisplayValue(
          parseDateToString({
            date: MIN_DATE,
            isDateTimeInput: true,
            userTimezone: undefined,
          }),
        );
      }),
      waitFor(() => {
        const expectedDate = DateTime.fromJSDate(MIN_DATE)
          .toLocal()
          .set({
            day: MIN_DATE.getUTCDate(),
            month: MIN_DATE.getUTCMonth() + 1,
            year: MIN_DATE.getUTCFullYear(),
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          });

        const selectedDay = within(datePicker).getByRole('option', {
          selected: true,
          name: (accessibleName) => {
            // The name looks like "Choose Sunday, December 31st, 1899"
            return accessibleName.includes(expectedDate.toFormat('yyyy'));
          },
        });
        expect(selectedDay).toBeVisible();
      }),
    ]);
  },
};

export const DefaultsToMaxValueWhenTypingReallyFarDate: Story = {
  args: {
    label: 'Created At',
    defaultValue: undefined,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy hh:mm');
    expect(input).toBeVisible();

    await userEvent.click(input);

    const datePicker = await canvas.findByRole('dialog');
    expect(datePicker).toBeVisible();

    await Promise.all([
      userEvent.type(input, '02/02/2500 10:10{Enter}'),

      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(MAX_DATE.toISOString());
      }),
      waitFor(() => {
        expect(input).toHaveDisplayValue(
          parseDateToString({
            date: MAX_DATE,
            isDateTimeInput: true,
            userTimezone: undefined,
          }),
        );
      }),
      waitFor(() => {
        const expectedDate = DateTime.fromJSDate(MAX_DATE)
          .toLocal()
          .set({
            day: MAX_DATE.getUTCDate(),
            month: MAX_DATE.getUTCMonth() + 1,
            year: MAX_DATE.getUTCFullYear(),
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          });

        const selectedDay = within(datePicker).getByRole('option', {
          selected: true,
          name: (accessibleName) => {
            // The name looks like "Choose Thursday, December 30th, 2100"
            return accessibleName.includes(expectedDate.toFormat('yyyy'));
          },
        });
        expect(selectedDay).toBeVisible();
      }),
    ]);
  },
};

export const SwitchesToStandaloneVariable: Story = {
  args: {
    label: 'Created At',
    defaultValue: undefined,
    onPersist: fn(),
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect('{{test}}');
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

    const variableTag = await canvas.findByText('test');
    expect(variableTag).toBeVisible();

    const removeVariableButton = canvasElement.querySelector(
      'button .tabler-icon-x',
    );

    await Promise.all([
      userEvent.click(removeVariableButton),

      waitForElementToBeRemoved(variableTag),
      waitFor(() => {
        const input = canvas.getByPlaceholderText('mm/dd/yyyy hh:mm');
        expect(input).toBeVisible();
      }),
    ]);
  },
};

export const ClickingOutsideDoesNotResetInputState: Story = {
  args: {
    label: 'Created At',
    defaultValue: `${currentYear}-12-09T13:20:19.631Z`,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const defaultValueAsDisplayString = parseDateToString({
      date: new Date(args.defaultValue!),
      isDateTimeInput: true,
      userTimezone: undefined,
    });

    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy hh:mm');
    expect(input).toBeVisible();
    expect(input).toHaveDisplayValue(defaultValueAsDisplayString);

    await userEvent.type(input, '{Backspace}{Backspace}');

    const datePicker = await canvas.findByRole('dialog');
    expect(datePicker).toBeVisible();

    await Promise.all([
      userEvent.click(canvasElement),

      waitForElementToBeRemoved(datePicker),
    ]);

    expect(args.onPersist).not.toHaveBeenCalled();

    expect(input).toHaveDisplayValue(defaultValueAsDisplayString.slice(0, -2));
  },
};

export const Disabled: Story = {
  args: {
    label: 'Created At',
    defaultValue: `${currentYear}-12-09T13:20:19.631Z`,
    onPersist: fn(),
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByDisplayValue(
      new RegExp(`12/09/${currentYear} \\d{2}:20`),
    );
    expect(input).toBeDisabled();
  },
};

export const DisabledWithVariable: Story = {
  args: {
    label: 'Created At',
    defaultValue: `{{a.b.c}}`,
    onPersist: fn(),
    readonly: true,
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect('{{test}}');
          }}
        >
          Add variable
        </button>
      );
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const variableChip = await canvas.findByText('c');
    expect(variableChip).toBeVisible();
  },
};
