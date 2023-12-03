import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useDateTimeField } from '../../../hooks/useDateTimeField';
import { DateFieldInput, DateFieldInputProps } from '../DateFieldInput';

const formattedDate = new Date();

const DateFieldValueSetterEffect = ({ value }: { value: Date }) => {
  const { setFieldValue } = useDateTimeField();

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
      <FieldContextProvider
        fieldDefinition={{
          fieldMetadataId: 'date',
          label: 'Date',
          type: 'DATE_TIME',
          iconName: 'IconCalendarEvent',
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
      </FieldContextProvider>
      <div data-testid="data-field-input-click-outside-div"></div>
    </div>
  );
};

const escapeJestFn = fn();
const enterJestFn = fn();
const clickOutsideJestFn = fn();

const meta: Meta = {
  title: 'UI/Data/Field/Input/DateFieldInput',
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
