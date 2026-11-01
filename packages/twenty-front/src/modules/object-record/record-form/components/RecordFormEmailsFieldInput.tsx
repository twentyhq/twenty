import { EmailsFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/EmailsFieldMenuItem';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { RecordFormMultiItemList } from '@/object-record/record-form/components/RecordFormMultiItemList';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { getRecordFormItemIndexAfterSave } from '@/object-record/record-form/utils/getRecordFormItemIndexAfterSave';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useRef, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInvalidInputLeft, setIsInvalidInputLeft] = useState(false);

  const {
    isInputOpen,
    editedItemIndex,
    inputValue,
    hasError,
    startAddingItem,
    startEditingItem,
    closeInput,
    handleInputChange,
    validateInputValue,
  } = useMultiItemInput({
    items: savedEmails,
    getItemText: getEmailText,
    isInputInitiallyOpen: isSingleItemMode || savedEmails.length < maxItemCount,
    initialEditedItemIndex:
      isSingleItemMode && savedEmails.length > 0 ? 0 : null,
    validateInput: validateEmail,
  });

  const openNextInput = (emails: string[]) => {
    if (isSingleItemMode && isNonEmptyArray(emails)) {
      startEditingItem({ itemIndex: 0, currentItems: emails });
      return;
    }

    if (emails.length < maxItemCount) {
      startAddingItem();
      return;
    }

    closeInput();
  };

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

  const saveInputValue = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedEmails = getEmailsWithInput(sanitizedInput);

    saveEmails(updatedEmails);

    return updatedEmails;
  };

  const handleEnter = () => {
    const updatedEmails = saveInputValue();

    if (!isDefined(updatedEmails) || isSingleItemMode) {
      return;
    }

    setShouldFocusInput(true);
    openNextInput(updatedEmails);
    inputRef.current?.focus();
  };

  const handleEscape = () => {
    saveEmails(savedEmails);
    openNextInput(savedEmails);
  };

  const saveInputValueBeforeRowAction = (itemIndex: number) => {
    const updatedEmails = saveInputValue();

    if (!isDefined(updatedEmails)) {
      return null;
    }

    const hasRemovedEditedItem = updatedEmails.length < savedEmails.length;

    return {
      updatedEmails,
      itemIndexAfterSave: getRecordFormItemIndexAfterSave({
        itemIndex,
        removedItemIndex: hasRemovedEditedItem ? editedItemIndex : null,
      }),
    };
  };

  const handleEdit = (index: number) => {
    const saveResult = saveInputValueBeforeRowAction(index);

    if (!isDefined(saveResult)) {
      return;
    }

    setShouldFocusInput(true);
    if (isDefined(saveResult.itemIndexAfterSave)) {
      startEditingItem({
        itemIndex: saveResult.itemIndexAfterSave,
        currentItems: saveResult.updatedEmails,
      });
      return;
    }

    openNextInput(saveResult.updatedEmails);
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
    const saveResult = saveInputValueBeforeRowAction(itemIndex);

    if (!isDefined(saveResult)) {
      return;
    }

    const updatedEmails = isDefined(saveResult.itemIndexAfterSave)
      ? getUpdatedEmails({
          emails: saveResult.updatedEmails,
          itemIndex: saveResult.itemIndexAfterSave,
        })
      : saveResult.updatedEmails;

    saveEmails(updatedEmails);
    openNextInput(updatedEmails);
  };

  const isInputValueInvalid = hasError || isInvalidInputLeft;
  const shouldShowItems = !isSingleItemMode && isNonEmptyArray(savedEmails);
  const visibleEmails = shouldShowItems ? savedEmails : undefined;
  const shouldShowInputInFooter = isInputOpen && !isEditingItemInPlace;
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
            isAddingNewItem={!isDefined(editedItemIndex)}
            onClick={handleEnter}
          />
        )
      }
    >
      <MultiItemFieldTextInput
        ref={inputRef}
        autoFocus={shouldFocusInput}
        spacing={inputSpacing}
        placeholder={placeholder ?? t`Email`}
        value={inputValue}
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
        hasError={isInputValueInvalid}
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
      {isInputValueInvalid ? (
        <Field.Error match role="alert">
          {t`Enter a valid email`}
        </Field.Error>
      ) : null}
    </FormFieldInputContainer>
  );
};
