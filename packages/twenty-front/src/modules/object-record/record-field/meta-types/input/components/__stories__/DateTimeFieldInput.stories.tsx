import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useEffect } from 'react';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { FieldMetadataType } from '~/generated/graphql';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { StorybookFieldInputDropdownFocusIdSetterEffect } from '~/testing/components/StorybookFieldInputDropdownFocusIdSetterEffect';
import { useDateTimeField } from '../../../hooks/useDateTimeField';
import {
  DateTimeFieldInput,
  DateTimeFieldInputProps,
} from '../DateTimeFieldInput';
const formattedDate = new Date(2022, 0, 1, 2, 0, 0);

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
  recordId?: string;
};

const DateFieldInputWithContext = ({
  value,
  recordId,
  onEscape,
  onEnter,
  onClickOutside,
}: DateFieldInputWithContextProps) => {
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(DEFAULT_CELL_SCOPE.scope);
  }, [setHotkeyScope]);

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordFieldInputId(
          recordId ?? '',
          'Date',
          'record-table-cell',
        ),
      }}
    >
      <FieldContext.Provider
        value={{
          fieldDefinition: {
            fieldMetadataId: 'date',
            defaultValue: null,
            label: 'Date',
            type: FieldMetadataType.DATE_TIME,
            iconName: 'IconCalendarEvent',
            metadata: {
              fieldName: 'Date',
              objectMetadataNameSingular: 'person',
            },
          },
          recordId: '123',
          isLabelIdentifier: false,
          isReadOnly: false,
        }}
      >
        <StorybookFieldInputDropdownFocusIdSetterEffect />
        <DateFieldValueSetterEffect value={value} />
        <DateFieldValueGater
          onEscape={onEscape}
          onEnter={onEnter}
          onClickOutside={onClickOutside}
        />
      </FieldContext.Provider>
      <div data-testid="data-field-input-click-outside-div"></div>
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const escapeJestFn = fn();
const enterJestFn = fn();
const clickOutsideJestFn = fn();

const meta: Meta = {
  title: 'UI/Data/Field/Input/DateTimeFieldInput',
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
    const div = await canvas.findByText('January');

    await expect(div.innerText).toContain('January');
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(clickOutsideJestFn).toHaveBeenCalledTimes(0);

    await canvas.findByText('January');
    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');
    await userEvent.click(emptyDiv);

    await expect(clickOutsideJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Escape: Story = {
  play: async ({ canvasElement }) => {
    await expect(escapeJestFn).toHaveBeenCalledTimes(0);
    const canvas = within(canvasElement);

    await canvas.findByText('January');
    await userEvent.keyboard('{escape}');

    await expect(escapeJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Enter: Story = {
  play: async ({ canvasElement }) => {
    await expect(enterJestFn).toHaveBeenCalledTimes(0);
    const canvas = within(canvasElement);

    await canvas.findByText('January');
    await userEvent.keyboard('{enter}');

    await expect(enterJestFn).toHaveBeenCalledTimes(1);
  },
};
