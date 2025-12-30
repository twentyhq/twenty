import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useEmailsField } from '@/object-record/record-field/ui/meta-types/hooks/useEmailsField';
import { EmailsFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/EmailsFieldMenuItem';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { emailsSchema } from '@/object-record/record-field/ui/types/guards/isFieldEmailsValue';
import { emailSchema } from '@/object-record/record-field/ui/validation-schemas/emailSchema';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useContext, useMemo } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { MultiItemFieldInput } from './MultiItemFieldInput';

export const EmailsFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useEmailsField();
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  const { onEscape, onClickOutside, onEnter } = useContext(
    FieldInputEventContext,
  );

  const emails = useMemo<string[]>(
    () =>
      [
        draftValue?.primaryEmail ? draftValue?.primaryEmail : null,
        ...(draftValue?.additionalEmails ?? []),
      ].filter(isDefined),
    [draftValue?.primaryEmail, draftValue?.additionalEmails],
  );

  const parseStringArrayToEmailsValue = (emails: string[]) => {
    const [nextPrimaryEmail, ...nextAdditionalEmails] = emails;

    const nextValue: FieldEmailsValue = {
      primaryEmail: nextPrimaryEmail ?? '',
      additionalEmails: nextAdditionalEmails,
    };

    const parseResponse = emailsSchema.safeParse(nextValue);

    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handleChange = (updatedEmails: string[]) => {
    const nextValue = parseStringArrayToEmailsValue(updatedEmails);

    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
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

  const setIsFieldInError = useSetRecoilComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: any[]) => {
    setIsFieldInError(hasError && values.length === 0);
  };

  const handleCopy = (email: string) => {
    copyToClipboard(email, t`Email copied to clipboard`);
  };

  const handleClickOutside = (
    updatedEmails: string[],
    event: MouseEvent | TouchEvent,
  ) => {
    onClickOutside?.({
      newValue: parseStringArrayToEmailsValue(updatedEmails),
      event,
    });
  };

  const handleEscape = (updatedEmails: string[]) => {
    onEscape?.({ newValue: parseStringArrayToEmailsValue(updatedEmails) });
  };

  const handleEnter = (updatedEmails: string[]) => {
    onEnter?.({ newValue: parseStringArrayToEmailsValue(updatedEmails) });
  };

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  return (
    <MultiItemFieldInput
      items={emails}
      onChange={handleChange}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onClickOutside={handleClickOutside}
      placeholder={t`Email`}
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
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
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
      onError={handleError}
      maxItemCount={maxNumberOfValues}
    />
  );
};
