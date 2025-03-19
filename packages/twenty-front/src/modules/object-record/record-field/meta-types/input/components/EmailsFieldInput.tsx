import { useEmailsField } from '@/object-record/record-field/meta-types/hooks/useEmailsField';
import { EmailsFieldMenuItem } from '@/object-record/record-field/meta-types/input/components/EmailsFieldMenuItem';
import { emailSchema } from '@/object-record/record-field/validation-schemas/emailSchema';
import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { MultiItemFieldInput } from './MultiItemFieldInput';

type EmailsFieldInputProps = {
  onCancel?: () => void;
  onClickOutside?: (event: MouseEvent | TouchEvent) => void;
  onError?: (hasError: boolean, value: any) => void;
};

export const EmailsFieldInput = ({
  onCancel,
  onClickOutside,
  onError,
}: EmailsFieldInputProps) => {
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
      isValid: emailSchema.safeParse(input).success,
      errorMessage: '',
    }),
    [],
  );

  const isPrimaryEmail = (index: number) => index === 0 && emails?.length > 1;

  return (
    <MultiItemFieldInput
      items={emails}
      onPersist={handlePersistEmails}
      onCancel={onCancel}
      onClickOutside={onClickOutside}
      placeholder="Email"
      fieldMetadataType={FieldMetadataType.EMAILS}
      validateInput={validateInput}
      onError={onError}
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
          isPrimary={isPrimaryEmail(index)}
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
