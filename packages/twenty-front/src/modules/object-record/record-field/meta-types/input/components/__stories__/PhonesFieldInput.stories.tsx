import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePhonesField } from '@/object-record/record-field/meta-types/hooks/usePhonesField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldInputClickOutsideEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { PhonesFieldInput } from '../PhonesFieldInput';

const updateRecord = fn();

const PhoneValueSetterEffect = ({ value }: { value: FieldPhonesValue }) => {
  const { setFieldValue } = usePhonesField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

type PhoneFieldValueGaterProps = Pick<
  PhoneInputWithContextProps,
  'onCancel' | 'onClickOutside'
>;

const PhoneFieldValueGater = ({
  onCancel,
  onClickOutside,
}: PhoneFieldValueGaterProps) => {
  const { fieldValue } = usePhonesField();

  return (
    fieldValue && (
      <PhonesFieldInput onCancel={onCancel} onClickOutside={onClickOutside} />
    )
  );
};

type PhoneInputWithContextProps = {
  value: FieldPhonesValue;
  recordId?: string;
  onCancel?: () => void;
  onClickOutside?: FieldInputClickOutsideEvent;
};

const PhoneInputWithContext = ({
  value,
  recordId = 'record-id',
  onCancel,
  onClickOutside,
}: PhoneInputWithContextProps) => {
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(DEFAULT_CELL_SCOPE.scope);
  }, [setHotkeyScope]);

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordFieldInputId(
          recordId,
          'phones',
          'record-table-cell',
        ),
      }}
    >
      <FieldContext.Provider
        value={{
          fieldDefinition: {
            fieldMetadataId: 'phones',
            label: 'Phones',
            type: FieldMetadataType.PHONES,
            iconName: 'IconMail',
            metadata: {
              fieldName: 'phones',
              placeHolder: 'Phone',
              objectMetadataNameSingular: 'company',
            },
          },
          recordId,
          isLabelIdentifier: false,
          isReadOnly: false,
          useUpdateRecord: () => [updateRecord, { loading: false }],
        }}
      >
        <PhoneValueSetterEffect value={value} />
        <PhoneFieldValueGater
          onCancel={onCancel}
          onClickOutside={onClickOutside}
        />
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const meta: Meta<typeof PhoneInputWithContext> = {
  title: 'UI/Input/PhonesFieldInput',
  component: PhoneInputWithContext,
};

export default meta;
type Story = StoryObj<typeof PhoneInputWithContext>;

export const Default: Story = {
  args: {
    value: {
      primaryPhoneCountryCode: 'FR',
      primaryPhoneNumber: '642646272',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [
        {
          countryCode: 'FR',
          number: '642646273',
          callingCode: '+33',
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addButton = await canvas.findByText('Add Phone');
    await userEvent.click(addButton);

    const input = await canvas.findByPlaceholderText('Phone');
    await userEvent.type(input, '+33642646274{enter}');

    const newPhoneElement = await canvas.findByText('+33 6 42 64 62 74');
    expect(newPhoneElement).toBeVisible();
  },
};

export const TrimInput: Story = {
  args: {
    value: {
      primaryPhoneCountryCode: 'FR',
      primaryPhoneNumber: '642646272',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [
        {
          countryCode: 'FR',
          number: '642646273',
          callingCode: '+33',
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addButton = await canvas.findByText('Add Phone');
    await userEvent.click(addButton);

    const input = await canvas.findByPlaceholderText('Phone');
    await userEvent.type(input, '+33642646274  {enter}');

    const newPhoneElement = await canvas.findByText('+33 6 42 64 62 74');
    expect(newPhoneElement).toBeVisible();

    // Verify the update was called with swapped phones
    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith({
        variables: {
          where: { id: 'record-id' },
          updateOneRecordInput: {
            phones: {
              primaryPhoneCallingCode: '+33',
              primaryPhoneCountryCode: 'FR',
              primaryPhoneNumber: '642646272',
              additionalPhones: [
                {
                  countryCode: 'FR',
                  number: '642646273',
                  callingCode: '+33',
                },
                {
                  countryCode: 'FR',
                  number: '642646274',
                  callingCode: '+33',
                },
              ],
            },
          },
        },
      });
    });
    expect(updateRecord).toHaveBeenCalledTimes(1);
  },
};

export const CanNotSetPrimaryLinkAsPrimaryLink: Story = {
  args: {
    value: {
      primaryPhoneCountryCode: 'FR',
      primaryPhoneNumber: '642646272',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const primaryPhone = await canvas.findByText('+33 6 42 64 62 72');
    expect(primaryPhone).toBeVisible();

    await userEvent.hover(primaryPhone);

    const openDropdownButtons = await canvas.findAllByRole('button', {
      expanded: false,
    });
    await userEvent.click(openDropdownButtons[0]);

    const editOption = await within(
      getCanvasElementForDropdownTesting(),
    ).findByText('Edit');

    expect(editOption).toBeVisible();

    const setPrimaryOption = within(
      getCanvasElementForDropdownTesting(),
    ).queryByText('Set as Primary');

    expect(setPrimaryOption).not.toBeInTheDocument();
  },
};
