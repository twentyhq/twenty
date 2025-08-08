import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useEmailsField } from '@/object-record/record-field/meta-types/hooks/useEmailsField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldEmailsValue } from '@/object-record/record-field/types/FieldMetadata';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { EmailsFieldInput } from '../EmailsFieldInput';

const updateRecord = fn();

const EmailValueSetterEffect = ({ value }: { value: FieldEmailsValue }) => {
  const { setFieldValue } = useEmailsField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

type EmailFieldValueGaterProps = Pick<
  EmailInputWithContextProps,
  'onCancel' | 'onClickOutside'
>;

const EmailFieldValueGater = ({
  onCancel,
  onClickOutside,
}: EmailFieldValueGaterProps) => {
  const { fieldValue } = useEmailsField();

  return (
    fieldValue && (
      <EmailsFieldInput onCancel={onCancel} onClickOutside={onClickOutside} />
    )
  );
};

type EmailInputWithContextProps = {
  value: FieldEmailsValue;
  recordId?: string;
  onCancel?: () => void;
  onClickOutside?: (event: MouseEvent | TouchEvent) => void;
};

const EmailInputWithContext = ({
  value,
  recordId = 'record-id',
  onCancel,
  onClickOutside,
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
        <EmailValueSetterEffect value={value} />
        <EmailFieldValueGater
          onCancel={onCancel}
          onClickOutside={onClickOutside}
        />
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

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith({
        variables: {
          where: { id: 'record-id' },
          updateOneRecordInput: {
            emails: {
              primaryEmail: 'john@example.com',
              additionalEmails: ['new.email@example.com'],
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
