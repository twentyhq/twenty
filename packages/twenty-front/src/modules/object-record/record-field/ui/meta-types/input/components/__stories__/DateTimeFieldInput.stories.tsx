import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useEffect } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { StorybookFieldInputDropdownFocusIdSetterEffect } from '~/testing/components/StorybookFieldInputDropdownFocusIdSetterEffect';
import { useDateTimeField } from '@/object-record/record-field/ui/meta-types/hooks/useDateTimeField';
import { DateTimeFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/DateTimeFieldInput';

const {
  FieldInputEventContextProviderWithJestMocks,
  handleEscapeMocked,
  handleClickoutsideMocked,
  handleEnterMocked,
} = getFieldInputEventContextProviderWithJestMocks();

const formattedDate = new Date(2022, 0, 1, 2, 0, 0);

const DateFieldValueSetterEffect = ({ value }: { value: Date }) => {
  const { setFieldValue } = useDateTimeField();

  useEffect(() => {
    setFieldValue(value.toISOString());
  }, [setFieldValue, value]);

  return <></>;
};

const DateFieldValueGater = () => {
  const { fieldValue } = useDateTimeField();

  return fieldValue && <DateTimeFieldInput />;
};

type DateFieldInputWithContextProps = {
  value: Date;
  recordId: string;
};

const DateFieldInputWithContext = ({
  value,
  recordId,
}: DateFieldInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: 'Date',
    prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
  });

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.OPENED_FIELD_INPUT,
        instanceId: instanceId,
      },
    });
  }, [pushFocusItemToFocusStack, instanceId]);

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: instanceId,
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
          recordId,
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <RecordFieldsScopeContextProvider
          value={{ scopeInstanceId: instanceId }}
        >
          <FieldInputEventContextProviderWithJestMocks>
            <StorybookFieldInputDropdownFocusIdSetterEffect />
            <DateFieldValueSetterEffect value={value} />
            <DateFieldValueGater />
          </FieldInputEventContextProviderWithJestMocks>
        </RecordFieldsScopeContextProvider>
      </FieldContext.Provider>
      <div data-testid="data-field-input-click-outside-div"></div>
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
    const div = await canvas.findByText('January');

    await expect(div.innerText).toContain('January');
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(handleClickoutsideMocked).toHaveBeenCalledTimes(0);

    await canvas.findByText('January');
    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');
    await userEvent.click(emptyDiv);

    await expect(handleClickoutsideMocked).toHaveBeenCalledTimes(1);
  },
};

export const Escape: Story = {
  play: async ({ canvasElement }) => {
    await expect(handleEscapeMocked).toHaveBeenCalledTimes(0);
    const canvas = within(canvasElement);

    await canvas.findByText('January');
    await userEvent.keyboard('{escape}');

    await expect(handleEscapeMocked).toHaveBeenCalledTimes(1);
  },
};

export const Enter: Story = {
  play: async ({ canvasElement }) => {
    await expect(handleEnterMocked).toHaveBeenCalledTimes(0);
    const canvas = within(canvasElement);

    await canvas.findByText('January');
    await userEvent.keyboard('{enter}');

    await expect(handleEnterMocked).toHaveBeenCalledTimes(1);
  },
};
