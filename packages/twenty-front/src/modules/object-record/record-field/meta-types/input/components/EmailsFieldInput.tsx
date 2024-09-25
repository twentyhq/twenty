import { useEmailsField } from '@/object-record/record-field/meta-types/hooks/useEmailsField';
import { EmailsFieldMenuItem } from '@/object-record/record-field/meta-types/input/components/EmailsFieldMenuItem';
import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { VALIDATORS } from '~/utils/validators';
import { MultiItemFieldInput } from './MultiItemFieldInput';

type EmailsFieldInputProps = {
  onCancel?: () => void;
};

export const EmailsFieldInput = ({ onCancel }: EmailsFieldInputProps) => {
  const { persistEmailsField, hotkeyScope, fieldValue } = useEmailsField();

  const emails = useMemo<string[]>(
    () =>
      [
        fieldValue?.primaryEmail ? fieldValue?.primaryEmail : null,
        ...(fieldValue?.additionalEmails ?? []),
      ].filter(isDefined),
    [fieldValue?.primaryEmail, fieldValue?.additionalEmails],
  );

  const handlePersistEmails = (updatedEmails: string[]) => {
    const [nextPrimaryEmail, ...nextAdditionalEmails] = updatedEmails;
    persistEmailsField({
      primaryEmail: nextPrimaryEmail ?? '',
      additionalEmails: nextAdditionalEmails,
    });
  };

  const validateInput = useCallback(
    (input: string) => ({
      isValid: VALIDATORS.EMAIL(input),
      errorMessage: 'Invalid email',
    }),
    [],
  );

  return (
    <MultiItemFieldInput
      items={emails}
      onPersist={handlePersistEmails}
      onCancel={onCancel}
      placeholder="Email"
      fieldMetadataType={FieldMetadataType.Emails}
      validateInput={validateInput}
      renderItem={({
        value: email,
        index,
        handleEdit,
        handleSetPrimary,
        handleDelete,
      }) => (
        <EmailsFieldMenuItem
          key={index}
          dropdownId={`${hotkeyScope}-emails-${index}`}
          isPrimary={index === 0}
          email={email}
          onEdit={handleEdit}
          onSetAsPrimary={handleSetPrimary}
          onDelete={handleDelete}
        />
      )}
      hotkeyScope={hotkeyScope}
    />
  );
};
