import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useEffect } from 'react';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useEmailsField } from '@/object-record/record-field/ui/meta-types/hooks/useEmailsField';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { EmailsFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/EmailsFieldInput';

const updateRecord = fn();

const { FieldInputEventContextProviderWithJestMocks } =
  getFieldInputEventContextProviderWithJestMocks();

const EmailValueSetterEffect = ({ value }: { value: FieldEmailsValue }) => {
  const { setFieldValue, setDraftValue } = useEmailsField();

  useEffect(() => {
    setFieldValue(value);
    setDraftValue(value);
  }, [setFieldValue, value, setDraftValue]);

  return null;
};

const EmailFieldValueGater = () => {
  const { fieldValue } = useEmailsField();

  return fieldValue && <EmailsFieldInput />;
};

type EmailInputWithContextProps = {
  value: FieldEmailsValue;
  recordId?: string;
};

const EmailInputWithContext = ({
  value,
  recordId = 'record-id',
}: EmailInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: 'emails',
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
            fieldMetadataId: 'emails',
            label: 'Emails',
            type: FieldMetadataType.EMAILS,
            iconName: 'IconMail',
            metadata: {
              fieldName: 'emails',
              placeHolder: 'Email',
              objectMetadataNameSingular: 'company',
            },
          },
          recordId,
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
          useUpdateRecord: () => [updateRecord, { loading: false }],
        }}
      >
        <FieldInputEventContextProviderWithJestMocks>
          <EmailValueSetterEffect value={value} />
          <EmailFieldValueGater />
        </FieldInputEventContextProviderWithJestMocks>
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const meta: Meta<typeof EmailInputWithContext> = {
  title: 'UI/Input/EmailsFieldInput',
  component: EmailInputWithContext,
  decorators: [SnackBarDecorator, I18nFrontDecorator],
};

export default meta;
type Story = StoryObj<typeof EmailInputWithContext>;

export const Default: Story = {
  args: {
    value: {
      primaryEmail: 'john@example.com',
      additionalEmails: ['john.doe@example.com'],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addButton = await canvas.findByText('Add Email');
    await userEvent.click(addButton);

    const input = await canvas.findByPlaceholderText('Email');
    await userEvent.type(input, 'new.email@example.com{enter}');

    const newEmailElement = await canvas.findByText('new.email@example.com');
    expect(newEmailElement).toBeVisible();
  },
};

export const TrimInput: Story = {
  args: {
    value: {
      primaryEmail: 'john@example.com',
      additionalEmails: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addButton = await canvas.findByText('Add Email');
    await userEvent.click(addButton);

    const input = await canvas.findByPlaceholderText('Email');
    await userEvent.type(input, '  new.email@example.com  {enter}');

    const newEmailElement = await canvas.findByText('new.email@example.com');
    expect(newEmailElement).toBeVisible();
  },
};

export const CanNotSetPrimaryLinkAsPrimaryLink: Story = {
  args: {
    value: {
      primaryEmail: 'primary@example.com',
      additionalEmails: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const primaryEmail = await canvas.findByText('primary@example.com');
    expect(primaryEmail).toBeVisible();

    await userEvent.hover(primaryEmail);

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
