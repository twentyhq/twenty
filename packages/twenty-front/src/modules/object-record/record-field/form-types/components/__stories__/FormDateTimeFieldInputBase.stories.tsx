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
import { FormDateTimeFieldInputBase } from '../FormDateTimeFieldInputBase';

const meta: Meta<typeof FormDateTimeFieldInputBase> = {
  title: 'UI/Data/Field/Form/Input/FormDateTimeFieldInputBase',
  component: FormDateTimeFieldInputBase,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormDateTimeFieldInputBase>;

export const DateDefault: Story = {
  args: {
    mode: 'date',
    label: 'Created At',
    defaultValue: '2024-12-09T13:20:19.631Z',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Created At');
    await canvas.findByDisplayValue('12/09/2024');
  },
};

export const DateWithDefaultEmptyValue: Story = {
  args: {
    mode: 'date',
    label: 'Created At',
    defaultValue: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Created At');
    await canvas.findByDisplayValue('');
    await canvas.findByPlaceholderText('mm/dd/yyyy');
  },
};

export const DateSetsDateWithInput: Story = {
  args: {
    mode: 'date',
    label: 'Created At',
    defaultValue: undefined,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy');

    await userEvent.click(input);

    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeVisible();

    await userEvent.type(input, '12/08/2024{enter}');

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith('2024-12-08T00:00:00.000Z');
    });

    expect(dialog).toBeVisible();
  },
};

export const DateSetsDateWithDatePicker: Story = {
  args: {
    mode: 'date',
    label: 'Created At',
    defaultValue: undefined,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy');
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
        expect(canvas.getByDisplayValue('12/07/2024')).toBeVisible();
      }),
    ]);
  },
};

export const DateResetsDateByClickingButton: Story = {
  args: {
    mode: 'date',
    label: 'Created At',
    defaultValue: '2024-12-09T13:20:19.631Z',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy');
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

export const DateResetsDateByErasingInputContent: Story = {
  args: {
    mode: 'date',
    label: 'Created At',
    defaultValue: '2024-12-09T13:20:19.631Z',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy');
    expect(input).toBeVisible();

    expect(input).toHaveDisplayValue('12/09/2024');

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

export const DateDefaultsToMinValueWhenTypingReallyOldDate: Story = {
  args: {
    mode: 'date',
    label: 'Created At',
    defaultValue: undefined,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy');
    expect(input).toBeVisible();

    await userEvent.click(input);

    const datePicker = await canvas.findByRole('dialog');
    expect(datePicker).toBeVisible();

    await Promise.all([
      userEvent.type(input, '02/02/1500{Enter}'),

      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(MIN_DATE.toISOString());
      }),
      waitFor(() => {
        expect(input).toHaveDisplayValue(
          parseDateToString({
            date: MIN_DATE,
            isDateTimeInput: false,
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

export const DateDefaultsToMaxValueWhenTypingReallyFarDate: Story = {
  args: {
    mode: 'date',
    label: 'Created At',
    defaultValue: undefined,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy');
    expect(input).toBeVisible();

    await userEvent.click(input);

    const datePicker = await canvas.findByRole('dialog');
    expect(datePicker).toBeVisible();

    await Promise.all([
      userEvent.type(input, '02/02/2500{Enter}'),

      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(MAX_DATE.toISOString());
      }),
      waitFor(() => {
        expect(input).toHaveDisplayValue(
          parseDateToString({
            date: MAX_DATE,
            isDateTimeInput: false,
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

export const DateSwitchesToStandaloneVariable: Story = {
  args: {
    mode: 'date',
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

    const removeVariableButton = canvas.getByTestId(/^remove-icon/);

    await Promise.all([
      userEvent.click(removeVariableButton),

      waitForElementToBeRemoved(variableTag),
      waitFor(() => {
        const input = canvas.getByPlaceholderText('mm/dd/yyyy');
        expect(input).toBeVisible();
      }),
    ]);
  },
};

export const DateClickingOutsideDoesNotResetInputState: Story = {
  args: {
    mode: 'date',
    label: 'Created At',
    defaultValue: '2024-12-09T13:20:19.631Z',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const defaultValueAsDisplayString = parseDateToString({
      date: new Date(args.defaultValue!),
      isDateTimeInput: false,
      userTimezone: undefined,
    });

    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy');
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

// ----

export const DateTimeDefault: Story = {
  args: {
    mode: 'datetime',
    label: 'Created At',
    defaultValue: '2024-12-09T13:20:19.631Z',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Created At');
    await canvas.findByDisplayValue(/12\/09\/2024 \d{2}:20/);
  },
};

export const DateTimeWithDefaultEmptyValue: Story = {
  args: {
    mode: 'datetime',
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

export const DateTimeSetsDateTimeWithInput: Story = {
  args: {
    mode: 'datetime',
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

    await userEvent.type(input, '12/08/2024 12:10{enter}');

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith(
        expect.stringMatching(/2024-12-08T\d{2}:10:00.000Z/),
      );
    });

    expect(dialog).toBeVisible();
  },
};

export const DateTimeDoesNotSetDateWithoutTime: Story = {
  args: {
    mode: 'datetime',
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

    await userEvent.type(input, '12/08/2024{enter}');

    expect(args.onPersist).not.toHaveBeenCalled();
    expect(dialog).toBeVisible();
  },
};

export const DateTimeSetsDateTimeWithDatePicker: Story = {
  args: {
    mode: 'datetime',
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
          canvas.getByDisplayValue(/12\/07\/2024 \d{2}:\d{2}/),
        ).toBeVisible();
      }),
    ]);
  },
};

export const DateTimeResetsDateByClickingButton: Story = {
  args: {
    mode: 'datetime',
    label: 'Created At',
    defaultValue: '2024-12-09T13:20:19.631Z',
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

export const DateTimeResetsDateByErasingInputContent: Story = {
  args: {
    mode: 'datetime',
    label: 'Created At',
    defaultValue: '2024-12-09T13:20:19.631Z',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByPlaceholderText('mm/dd/yyyy hh:mm');
    expect(input).toBeVisible();

    expect(input).toHaveDisplayValue(/12\/09\/2024 \d{2}:\d{2}/);

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

export const DateTimeDefaultsToMinValueWhenTypingReallyOldDate: Story = {
  args: {
    mode: 'datetime',
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

export const DateTimeDefaultsToMaxValueWhenTypingReallyFarDate: Story = {
  args: {
    mode: 'datetime',
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

export const DateTimeSwitchesToStandaloneVariable: Story = {
  args: {
    mode: 'datetime',
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

    const removeVariableButton = canvas.getByTestId(/^remove-icon/);

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

export const DateTimeClickingOutsideDoesNotResetInputState: Story = {
  args: {
    mode: 'datetime',
    label: 'Created At',
    defaultValue: '2024-12-09T13:20:19.631Z',
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
