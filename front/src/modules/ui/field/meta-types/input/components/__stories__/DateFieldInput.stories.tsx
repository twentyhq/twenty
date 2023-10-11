import { useEffect } from 'react';
import { expect } from '@storybook/jest';
import { jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

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
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope('hotkey-scope');
  }, [setHotkeyScope]);

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
      >
        <DateFieldValueSetterEffect value={value} />
        <DateFieldInput
          onEscape={onEscape}
          onEnter={onEnter}
          onClickOutside={onClickOutside}
        />
      </FieldInputContextProvider>
      <div data-testid="data-field-input-click-outside-div"></div>
    </div>
  );
};

const escapeJestFn = jest.fn();
const enterJestFn = jest.fn();
const clickOutsideJestFn = jest.fn();

const meta: Meta = {
  title: 'UI/Field/DateFieldInput',
  component: DateFieldInputWithContext,
  args: {
    value: formattedDate,
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
};

export default meta;

type Story = StoryObj<typeof DateFieldInputWithContext>;

export const Default: Story = {};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(clickOutsideJestFn).toHaveBeenCalledTimes(0);

    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');
    await userEvent.click(emptyDiv);

    await expect(clickOutsideJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Escape: Story = {
  play: async () => {
    await expect(escapeJestFn).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{esc}');

    await expect(escapeJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Enter: Story = {
  play: async () => {
    await expect(enterJestFn).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{enter}');

    await expect(enterJestFn).toHaveBeenCalledTimes(1);
  },
};
