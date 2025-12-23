import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useEffect } from 'react';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { usePhonesField } from '@/object-record/record-field/ui/meta-types/hooks/usePhonesField';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { PhonesFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldInput';

const { FieldInputEventContextProviderWithJestMocks } =
  getFieldInputEventContextProviderWithJestMocks();

const PhoneValueSetterEffect = ({ value }: { value: FieldPhonesValue }) => {
  const { setFieldValue, setDraftValue } = usePhonesField();

  useEffect(() => {
    setFieldValue(value);
    setDraftValue(value);
  }, [setFieldValue, value, setDraftValue]);

  return null;
};

const PhoneFieldValueGater = () => {
  const { fieldValue } = usePhonesField();

  return fieldValue && <PhonesFieldInput />;
};

type PhoneInputWithContextProps = {
  value: FieldPhonesValue;
  recordId?: string;
};

const PhoneInputWithContext = ({
  value,
  recordId = 'record-id',
}: PhoneInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: 'phones',
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
          isRecordFieldReadOnly: false,
          useUpdateRecord: () => [() => {}, { loading: false }],
        }}
      >
        <FieldInputEventContextProviderWithJestMocks>
          <PhoneValueSetterEffect value={value} />
          <PhoneFieldValueGater />
        </FieldInputEventContextProviderWithJestMocks>
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const meta: Meta<typeof PhoneInputWithContext> = {
  title: 'UI/Input/PhonesFieldInput',
  component: PhoneInputWithContext,
  decorators: [I18nFrontDecorator],
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
