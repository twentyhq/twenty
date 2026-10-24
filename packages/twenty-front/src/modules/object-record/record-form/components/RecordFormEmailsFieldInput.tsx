import { EmailsFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/EmailsFieldMenuItem';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { RecordFormMultiItemList } from '@/object-record/record-form/components/RecordFormMultiItemList';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { type MultiItemInputTarget } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemInputTarget';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { getRecordFormMultiItemInputTarget } from '@/object-record/record-form/utils/getRecordFormMultiItemInputTarget';
import { getRecordFormItemIndexAfterCommit } from '@/object-record/record-form/utils/getRecordFormItemIndexAfterCommit';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { emailSchema, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';

const getEmailText = (email: string) => email;

const validateEmail = (input: string) => ({
  isValid: emailSchema.safeParse(input).success,
  errorMessage: '',
});

const getEmailsFromValue = (value: FieldEmailsValue | undefined) =>
  [
    isNonEmptyString(value?.primaryEmail) ? value.primaryEmail : null,
    ...(value?.additionalEmails ?? []),
  ].filter(isDefined);

const getEmailsValue = (emails: string[]): FieldEmailsValue => {
  const [primaryEmail, ...additionalEmails] = emails;

  return { primaryEmail: primaryEmail ?? '', additionalEmails };
};

type RecordFormEmailsFieldInputProps = {
  label?: string;
  defaultValue?: FieldEmailsValue;
  maxNumberOfValues?: number | null;
  placeholder?: string;
  onChange: (value: FieldEmailsValue) => void;
};

export const RecordFormEmailsFieldInput = ({
  label,
  defaultValue,
  maxNumberOfValues,
  placeholder,
  onChange,
}: RecordFormEmailsFieldInputProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const instanceId = useId();

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const maxItemCount = maxNumberOfValues ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;
  const isSingleItemMode = maxItemCount === 1;

  const [savedEmails, setSavedEmails] = useState(() =>
    getEmailsFromValue(defaultValue),
  );
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [isInvalidInputLeft, setIsInvalidInputLeft] = useState(false);

  const getNextInputTarget = (emails: string[]): MultiItemInputTarget =>
    getRecordFormMultiItemInputTarget({
      itemCount: emails.length,
      maxItemCount,
    });

  const {
    inputTarget,
    inputValue,
    hasError,
    openInput,
    handleInputChange,
    validateInputValue,
  } = useMultiItemInput({
    items: savedEmails,
    getItemText: getEmailText,
    initialInputTarget: getNextInputTarget(savedEmails),
    validateInput: validateEmail,
  });

  const editedItemIndex =
    inputTarget.type === 'existing-item' ? inputTarget.itemIndex : null;
  const isEditingItemInPlace = isDefined(editedItemIndex) && !isSingleItemMode;

  const getEmailsWithInput = (sanitizedInput: string) =>
    computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items: savedEmails,
      editingIndex: isSingleItemMode ? 0 : editedItemIndex,
      singleItemMode: isSingleItemMode,
    });

  const saveEmails = (emails: string[]) => {
    setSavedEmails(emails);
    setIsInvalidInputLeft(false);
    setRecordFieldInputIsFieldInError(false);
    onChange(getEmailsValue(emails));
  };

  const isInputValueValid = (value: string) => {
    const sanitizedInput = value.trim();

    return (
      !isNonEmptyString(sanitizedInput) || validateEmail(sanitizedInput).isValid
    );
  };

  const handleTyping = (value: string) => {
    handleInputChange(value);
    setIsInvalidInputLeft(false);

    const sanitizedInput = value.trim();
    const isValid = isInputValueValid(value);

    setRecordFieldInputIsFieldInError(!isValid);
    onChange(
      getEmailsValue(
        isValid ? getEmailsWithInput(sanitizedInput) : savedEmails,
      ),
    );
  };

  const commitInput = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedEmails = getEmailsWithInput(sanitizedInput);

    saveEmails(updatedEmails);

    return updatedEmails;
  };

  const handleEnter = () => {
    const updatedEmails = commitInput();

    if (!isDefined(updatedEmails) || isSingleItemMode) {
      return;
    }

    setShouldFocusInput(true);
    openInput({ inputTarget: getNextInputTarget(updatedEmails) });
  };

  const handleEscape = () => {
    saveEmails(savedEmails);
    openInput({ inputTarget: getNextInputTarget(savedEmails) });
  };

  const commitInputBeforeRowAction = (itemIndex: number) => {
    const committedEmails = commitInput();

    if (!isDefined(committedEmails)) {
      return null;
    }

    const hasRemovedEditedItem = committedEmails.length < savedEmails.length;

    return {
      committedEmails,
      committedItemIndex: getRecordFormItemIndexAfterCommit({
        itemIndex,
        removedItemIndex: hasRemovedEditedItem ? editedItemIndex : null,
      }),
    };
  };

  const handleEdit = (index: number) => {
    const committed = commitInputBeforeRowAction(index);

    if (!isDefined(committed)) {
      return;
    }

    setShouldFocusInput(true);
    openInput({
      inputTarget: isDefined(committed.committedItemIndex)
        ? { type: 'existing-item', itemIndex: committed.committedItemIndex }
        : getNextInputTarget(committed.committedEmails),
      currentItems: committed.committedEmails,
    });
  };

  const updateEmails = ({
    itemIndex,
    getUpdatedEmails,
  }: {
    itemIndex: number;
    getUpdatedEmails: (params: {
      emails: string[];
      itemIndex: number;
    }) => string[];
  }) => {
    const committed = commitInputBeforeRowAction(itemIndex);

    if (!isDefined(committed)) {
      return;
    }

    const updatedEmails = isDefined(committed.committedItemIndex)
      ? getUpdatedEmails({
          emails: committed.committedEmails,
          itemIndex: committed.committedItemIndex,
        })
      : committed.committedEmails;

    saveEmails(updatedEmails);
    openInput({ inputTarget: getNextInputTarget(updatedEmails) });
  };

  const shouldShowItems = !isSingleItemMode && isNonEmptyArray(savedEmails);
  const visibleEmails = shouldShowItems ? savedEmails : undefined;
  const isInputDisplayed = inputTarget.type !== 'closed';
  const shouldShowInputInFooter = isInputDisplayed && !isEditingItemInPlace;
  const inputSpacing: MultiItemFieldInputSpacing = shouldShowItems
    ? 'compact'
    : 'default';

  const itemInput = (
    <MultiItemFieldInputRow
      spacing={inputSpacing}
      hasPadding={shouldShowItems && shouldShowInputInFooter}
      rightComponent={
        isSingleItemMode ? undefined : (
          <MultiItemFieldSaveButton
            isAddingNewItem={inputTarget.type === 'new-item'}
            onClick={handleEnter}
          />
        )
      }
    >
      <MultiItemFieldTextInput
        autoFocus={shouldFocusInput}
        spacing={inputSpacing}
        placeholder={placeholder ?? t`Email`}
        value={inputValue}
        hasError={hasError || isInvalidInputLeft}
        onBlur={() => setIsInvalidInputLeft(!isInputValueValid(inputValue))}
        onChange={handleTyping}
        onEnter={handleEnter}
        onEscape={handleEscape}
      />
    </MultiItemFieldInputRow>
  );

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}
      <RecordFormMultiItemList
        footer={shouldShowInputInFooter ? itemInput : undefined}
      >
        {visibleEmails?.map((email, index) =>
          index === editedItemIndex && isEditingItemInPlace ? (
            <MultiItemFieldEditedItem
              key={index}
              hasSeparatorBefore={index > 0}
              hasSeparatorAfter={index < savedEmails.length - 1}
            >
              {itemInput}
            </MultiItemFieldEditedItem>
          ) : (
            <EmailsFieldMenuItem
              key={index}
              dropdownId={`${instanceId}-email-${index}`}
              showPrimaryIcon={index === 0 && savedEmails.length > 1}
              showSetAsPrimaryButton={index > 0}
              showCopyButton={true}
              email={email}
              onEdit={() => handleEdit(index)}
              onSetAsPrimary={() =>
                updateEmails({
                  itemIndex: index,
                  getUpdatedEmails: ({ emails, itemIndex }) =>
                    moveArrayItem(emails, {
                      fromIndex: itemIndex,
                      toIndex: 0,
                    }),
                })
              }
              onDelete={() =>
                updateEmails({
                  itemIndex: index,
                  getUpdatedEmails: ({ emails, itemIndex }) =>
                    toSpliced(emails, itemIndex, 1),
                })
              }
              onCopy={(emailToCopy) =>
                copyToClipboard(emailToCopy, t`Email copied to clipboard`)
              }
            />
          ),
        )}
      </RecordFormMultiItemList>
      {hasError || isInvalidInputLeft ? (
        <Field.Error match role="alert">
          {t`Enter a valid email`}
        </Field.Error>
      ) : null}
    </FormFieldInputContainer>
  );
};
