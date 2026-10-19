import { EmailsFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/EmailsFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { emailsFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/emailsFieldValueSchema';
import { type FieldInputVariant } from '@/ui/field/input/types/FieldInputVariant';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useMemo } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { emailSchema, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type EmailsMultiItemInputProps = {
  value: FieldEmailsValue | null | undefined;
  fieldName: string;
  maxNumberOfValues?: number | null;
  variant?: FieldInputVariant;
  placeholder?: string;
  onChange: (value: FieldEmailsValue) => void;
  onEnter?: (value: FieldEmailsValue | undefined) => void;
  onEscape?: (value: FieldEmailsValue | undefined) => void;
  onSubmit?: (value: FieldEmailsValue | undefined) => void;
  onClickOutside?: (
    value: FieldEmailsValue | undefined,
    event: MouseEvent | TouchEvent,
  ) => void;
  onError?: (hasError: boolean, values: string[]) => void;
};

export const EmailsMultiItemInput = ({
  value,
  fieldName,
  maxNumberOfValues,
  variant,
  placeholder,
  onChange,
  onEnter,
  onEscape,
  onSubmit,
  onClickOutside,
  onError,
}: EmailsMultiItemInputProps) => {
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  const emails = useMemo<string[]>(
    () =>
      [
        isNonEmptyString(value?.primaryEmail) ? value.primaryEmail : null,
        ...(value?.additionalEmails ?? []),
      ].filter(isDefined),
    [value?.primaryEmail, value?.additionalEmails],
  );

  const parseStringArrayToEmailsValue = (emails: string[]) => {
    const [nextPrimaryEmail, ...nextAdditionalEmails] = emails;

    const nextValue: FieldEmailsValue = {
      primaryEmail: nextPrimaryEmail ?? '',
      additionalEmails: nextAdditionalEmails,
    };

    const parseResponse = emailsFieldValueSchema.safeParse(nextValue);

    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handleChange = (updatedEmails: string[]) => {
    const nextValue = parseStringArrayToEmailsValue(updatedEmails);

    if (isDefined(nextValue)) {
      onChange(nextValue);
    }
  };

  const validateInput = useCallback(
    (input: string) => ({
      isValid: emailSchema.safeParse(input).success,
      errorMessage: '',
    }),
    [],
  );

  const getShowPrimaryIcon = (index: number) =>
    index === 0 && emails.length > 1;
  const getShowSetAsPrimaryButton = (index: number) => index > 0;

  const handleCopy = (email: string) => {
    copyToClipboard(email, t`Email copied to clipboard`);
  };

  return (
    <MultiItemFieldInput
      variant={variant}
      items={emails}
      onChange={handleChange}
      onEnter={(updatedEmails) =>
        onEnter?.(parseStringArrayToEmailsValue(updatedEmails))
      }
      onSubmit={(updatedEmails) =>
        onSubmit?.(parseStringArrayToEmailsValue(updatedEmails))
      }
      onEscape={(updatedEmails) =>
        onEscape?.(parseStringArrayToEmailsValue(updatedEmails))
      }
      onClickOutside={(updatedEmails, event) =>
        onClickOutside?.(parseStringArrayToEmailsValue(updatedEmails), event)
      }
      placeholder={t`Email`}
      inputPlaceholder={placeholder}
      fieldMetadataType={FieldMetadataType.EMAILS}
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
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldName}-${index}`}
          showPrimaryIcon={getShowPrimaryIcon(index)}
          showSetAsPrimaryButton={getShowSetAsPrimaryButton(index)}
          showCopyButton={true}
          email={email}
          onEdit={handleEdit}
          onSetAsPrimary={handleSetPrimary}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />
      )}
      onError={onError}
      maxItemCount={maxNumberOfValues ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES}
    />
  );
};
