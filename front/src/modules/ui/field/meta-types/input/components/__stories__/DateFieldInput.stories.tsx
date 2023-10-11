import { useEffect } from 'react';
import { expect } from '@storybook/jest';
import { jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { TableHotkeyScope } from '@/ui/data-table/types/TableHotkeyScope';
import { sleep } from '~/testing/sleep';

import { useDateField } from '../../../hooks/useDateField';
import { DateFieldInput, DateFieldInputProps } from '../DateFieldInput';

import { FieldInputContextProvider } from './FieldInputContextProvider';

const formattedDate = new Date();

const DateFieldValueSetterEffect = ({ value }: { value: Date }) => {
  const { setFieldValue } = useDateField();

  useEffect(() => {
    setFieldValue(value.toISOString());
  }, [setFieldValue, value]);

  return <></>;
};

type DateFieldInputWithContextProps = DateFieldInputProps & {
  value: Date;
  entityId?: string;
};

const DateFieldInputWithContext = ({
  value,
  entityId,
  onEscape,
  onEnter,
  onClickOutside,
}: DateFieldInputWithContextProps) => {
  return (
    <div>
      <FieldInputContextProvider
        fieldDefinition={{
          key: 'date',
          name: 'Date',
          type: 'date',
          metadata: {
            fieldName: 'Date',
          },
        }}
        entityId={entityId}
        hotkeyScope={TableHotkeyScope.CellDateEditMode}
      >
        <DateFieldValueSetterEffect value={value} />
        <DateFieldInput
          onEscape={onEscape}
          onEnter={onEnter}
          onClickOutside={onClickOutside}
        />
      </FieldInputContextProvider>
      <div data-testid="data-field-input-test-div"></div>
    </div>
  );
};

const meta: Meta = {
  title: 'UI/Field/DateFieldInput',
  component: DateFieldInputWithContext,
  args: {
    value: formattedDate,
  },
};

export default meta;

type Story = StoryObj<typeof DateFieldInputWithContext>;

const escapeJestFn = jest.fn();
const enterJestFn = jest.fn();
const clickOutsideJestFn = jest.fn();

export const Default: Story = {};

export const ClickOutside: Story = {
  args: {
    onEscape: escapeJestFn,
    onEnter: enterJestFn,
    onClickOutside: clickOutsideJestFn,
  },
  argTypes: {
    onEscape: {
      control: false,
    },
    onEnter: {
      control: false,
    },
    onClickOutside: {
      control: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(clickOutsideJestFn).toHaveBeenCalledTimes(0);

    const emptyDiv = canvas.getByTestId('data-field-input-test-div');
    await userEvent.click(emptyDiv);

    await expect(clickOutsideJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Escape: Story = {
  args: {
    onEscape: escapeJestFn,
    onEnter: enterJestFn,
    onClickOutside: clickOutsideJestFn,
  },
  argTypes: {
    onEscape: {
      control: false,
    },
    onEnter: {
      control: false,
    },
    onClickOutside: {
      control: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const datePicker = canvas.getByTestId('date-picker');

    await datePicker.focus();

    sleep(1000);

    await expect(escapeJestFn).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{esc}');

    sleep(1000);

    await expect(escapeJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Enter: Story = {
  args: {
    onEscape: escapeJestFn,
    onEnter: enterJestFn,
    onClickOutside: clickOutsideJestFn,
  },
  argTypes: {
    onEscape: {
      control: false,
    },
    onEnter: {
      control: false,
    },
    onClickOutside: {
      control: false,
    },
  },
  play: async () => {
    await expect(escapeJestFn).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{enter}');

    sleep(1000);

    await expect(escapeJestFn).toHaveBeenCalledTimes(1);
  },
};
