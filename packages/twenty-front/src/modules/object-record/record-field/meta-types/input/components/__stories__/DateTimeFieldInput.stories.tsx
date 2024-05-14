import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { FieldMetadataType } from '~/generated/graphql';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useDateTimeField } from '../../../hooks/useDateTimeField';
import {
  DateTimeFieldInput,
  DateTimeFieldInputProps,
} from '../DateTimeFieldInput';

const formattedDate = new Date(2022, 1, 1);

const DateFieldValueSetterEffect = ({ value }: { value: Date }) => {
  const { setFieldValue } = useDateTimeField();

  useEffect(() => {
    setFieldValue(value.toISOString());
  }, [setFieldValue, value]);

  return <></>;
};

type DateFieldValueGaterProps = Pick<
  DateTimeFieldInputProps,
  'onEscape' | 'onEnter' | 'onClickOutside'
>;

const DateFieldValueGater = ({
  onEscape,
  onEnter,
  onClickOutside,
}: DateFieldValueGaterProps) => {
  const { fieldValue } = useDateTimeField();

  return (
    fieldValue && (
      <DateTimeFieldInput
        onEscape={onEscape}
        onEnter={onEnter}
        onClickOutside={onClickOutside}
      />
    )
  );
};

type DateFieldInputWithContextProps = DateTimeFieldInputProps & {
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
          defaultValue: null,
          label: 'Date',
          type: FieldMetadataType.DateTime,
          iconName: 'IconCalendarEvent',
          metadata: {
            fieldName: 'Date',
            objectMetadataNameSingular: 'person',
          },
        }}
        entityId={entityId}
      >
        <DateFieldValueSetterEffect value={value} />
        <DateFieldValueGater
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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const div = await canvas.findByText('February');

    await expect(div.innerText).toContain('February');
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(clickOutsideJestFn).toHaveBeenCalledTimes(0);

    await canvas.findByText('February');
    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');
    await userEvent.click(emptyDiv);

    await expect(clickOutsideJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Escape: Story = {
  play: async ({ canvasElement }) => {
    await expect(escapeJestFn).toHaveBeenCalledTimes(0);
    const canvas = within(canvasElement);

    await canvas.findByText('February');
    await userEvent.keyboard('{escape}');

    await expect(escapeJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Enter: Story = {
  play: async ({ canvasElement }) => {
    await expect(enterJestFn).toHaveBeenCalledTimes(0);
    const canvas = within(canvasElement);

    await canvas.findByText('February');
    await userEvent.keyboard('{enter}');

    await expect(enterJestFn).toHaveBeenCalledTimes(1);
  },
};
