import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useDateTimeField } from '@/object-record/record-field/ui/meta-types/hooks/useDateTimeField';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { DateTimeFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/DateTimeFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const {
  FieldInputEventContextProviderWithJestMocks,
  handleEscapeMocked,
  handleClickoutsideMocked,
  handleEnterMocked,
} = getFieldInputEventContextProviderWithJestMocks();

const formattedDate = new Date('2022-01-01T02:00:00.000Z');

const DateFieldValueSetterEffect = ({ value }: { value: Date }) => {
  const { setFieldValue } = useDateTimeField();

  useEffect(() => {
    setFieldValue(value.toISOString());
  }, [setFieldValue, value]);

  return null;
};

const DateFieldValueGater = () => {
  const { fieldValue } = useDateTimeField();

  return isNonEmptyString(fieldValue) ? <DateTimeFieldInput /> : null;
};

type DateFieldInputWithContextProps = {
  value: Date;
  recordId: string;
};

const DateFieldInputFocusEffect = ({ instanceId }: { instanceId: string }) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.OPENED_FIELD_INPUT,
        instanceId,
      },
    });
  }, [pushFocusItemToFocusStack, instanceId]);

  return null;
};

const DateFieldInputWithContext = ({
  value,
  recordId,
}: DateFieldInputWithContextProps) => {
  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: 'Date',
    prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
  });

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: instanceId,
      }}
    >
      <DateFieldInputFocusEffect instanceId={instanceId} />
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
          recordId,
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <FieldInputEventContextProviderWithJestMocks>
          <DateFieldValueSetterEffect value={value} />
          <DateFieldValueGater />
        </FieldInputEventContextProviderWithJestMocks>
      </FieldContext.Provider>
      <Button>Outside date field</Button>
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/DateTimeFieldInput',
  component: DateFieldInputWithContext,
  args: {
    value: formattedDate,
    onEscape: handleEscapeMocked,
    onEnter: handleEnterMocked,
    onClickOutside: handleClickoutsideMocked,
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

    await expect(
      await canvas.findByRole('combobox', { name: 'Month' }),
    ).toBeVisible();
    await expect(canvas.getByRole('grid')).toBeVisible();
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(handleClickoutsideMocked).not.toHaveBeenCalled();
    await userEvent.click(
      await canvas.findByRole('combobox', { name: 'Month' }),
    );
    await body.findByRole('listbox');

    const outsideButton = canvas.getByRole('button', {
      name: 'Outside date field',
    });
    await userEvent.click(outsideButton);
    await waitFor(() =>
      expect(body.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    await expect(handleClickoutsideMocked).not.toHaveBeenCalled();
    await userEvent.click(outsideButton);

    await expect(handleClickoutsideMocked).toHaveBeenCalledTimes(1);
  },
};

export const Escape: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(handleEscapeMocked).not.toHaveBeenCalled();
    await userEvent.click(
      await canvas.findByRole('combobox', { name: 'Month' }),
    );
    await body.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    await expect(handleEscapeMocked).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');

    await expect(handleEscapeMocked).toHaveBeenCalledTimes(1);
  },
};

export const Enter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(handleEnterMocked).not.toHaveBeenCalled();
    await userEvent.click(
      await canvas.findByRole('combobox', { name: 'Month' }),
    );
    await body.findByRole('listbox');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    await expect(handleEnterMocked).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('textbox', { name: 'Time' }));
    await userEvent.keyboard('{Enter}');

    await expect(handleEnterMocked).toHaveBeenCalledTimes(1);
  },
};

export const CalendarNavigationDoesNotSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateInput = await canvas.findByRole('textbox', {
      name: 'Date and time',
    });
    const initialValue = (dateInput as HTMLInputElement).value;
    const monthSelect = canvas.getByRole('combobox', { name: 'Month' });
    const initialMonth = monthSelect.innerText;
    const nextMonth = canvas.getByRole('button', { name: 'Next month' });

    nextMonth.focus();
    await userEvent.keyboard('{Enter}');
    await expect(handleEnterMocked).not.toHaveBeenCalled();
    await expect(dateInput).toHaveValue(initialValue);
    canvas.getByRole('button', { name: 'Previous month' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(monthSelect).toHaveTextContent(initialMonth);
    await expect(dateInput).toHaveValue(initialValue);
    await expect(handleEnterMocked).not.toHaveBeenCalled();
  },
};
