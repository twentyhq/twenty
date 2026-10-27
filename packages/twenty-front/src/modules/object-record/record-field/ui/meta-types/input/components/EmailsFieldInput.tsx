import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useEmailsField } from '@/object-record/record-field/ui/meta-types/hooks/useEmailsField';
import { EmailsFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/EmailsFieldMenuItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldList } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldList';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { emailsFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/emailsFieldValueSchema';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useRef } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { emailSchema, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const getEmailText = (email: string) => email;

const validateEmail = (input: string) => ({
  isValid: emailSchema.safeParse(input).success,
  errorMessage: '',
});

export const EmailsFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useEmailsField();
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const containerRef = useRef<HTMLDivElement>(null);

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

    const parseResponse = emailsFieldValueSchema.safeParse(nextValue);

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

  const handleSubmit = (updatedEmails: string[]) => {
    if (isDeeplyEqual(emails, updatedEmails)) {
      return;
    }

    onSubmit?.({
      newValue: parseStringArrayToEmailsValue(updatedEmails),
      skipClose: true,
    });
  };

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;
  const isSingleItemMode = maxNumberOfValues === 1;
  const isLimitReached = emails.length >= maxNumberOfValues;

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
    items: emails,
    getItemText: getEmailText,
    isInputInitiallyOpen: emails.length === 0 || isSingleItemMode,
    initialEditedItemIndex: isSingleItemMode && emails.length > 0 ? 0 : null,
    validateInput: validateEmail,
    onHasErrorChange: (hasError) =>
      setRecordFieldInputIsFieldInError(hasError && emails.length === 0),
  });

  const {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  } = useMultiItemSearch({ items: emails, getItemText: getEmailText });

  const isEditingItemInPlace = isDefined(editedItemIndex) && !isSingleItemMode;

  const saveInputValue = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedEmails = computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items: emails,
      editingIndex: editedItemIndex,
      singleItemMode: isSingleItemMode,
    });

    handleChange(updatedEmails);

    return updatedEmails;
  };

  const handleInputEnter = () => {
    const updatedEmails = saveInputValue();

    if (!isDefined(updatedEmails)) {
      return;
    }

    if (isSingleItemMode) {
      onEnter?.({ newValue: parseStringArrayToEmailsValue(updatedEmails) });
    } else {
      handleSubmit(updatedEmails);
    }

    closeInput();
  };

  const handleAddClick = () => {
    if (isEditingItemInPlace) {
      const updatedEmails = saveInputValue();

      if (!isDefined(updatedEmails)) {
        return;
      }

      handleSubmit(updatedEmails);
    }

    setSearchFilter('');
    startAddingItem();
  };

  const handleEscape = () => {
    onEscape?.({ newValue: parseStringArrayToEmailsValue(emails) });
  };

  useMultiItemFieldDismiss({
    containerRef,
    onEscape: handleEscape,
    onClickOutside: (event) => {
      const updatedEmails = isInputOpen ? saveInputValue() : emails;

      if (!isDefined(updatedEmails)) {
        return;
      }

      onClickOutside?.({
        newValue: parseStringArrayToEmailsValue(updatedEmails),
        event,
      });
    },
  });

  const handleSetAsPrimary = (index: number) => {
    const updatedEmails = moveArrayItem(emails, {
      fromIndex: index,
      toIndex: 0,
    });

    if (isEditingItemInPlace) {
      closeInput();
    }

    handleChange(updatedEmails);
    handleSubmit(updatedEmails);
  };

  const handleDelete = (index: number) => {
    const updatedEmails = toSpliced(emails, index, 1);

    handleChange(updatedEmails);
    handleSubmit(updatedEmails);
    if (isNonEmptyArray(updatedEmails)) {
      closeInput();
    } else {
      startAddingItem();
    }
  };

  const handleCopy = (email: string) => {
    copyToClipboard(email, t`Email copied to clipboard`);
  };

  const shouldShowItems =
    isNonEmptyArray(filteredItemEntries) && (!isSingleItemMode || !isInputOpen);
  const visibleItemEntries = shouldShowItems ? filteredItemEntries : undefined;
  const shouldShowInputInFooter = isInputOpen && !isEditingItemInPlace;
  const inputSpacing: MultiItemFieldInputSpacing =
    isNonEmptyArray(emails) && !isSingleItemMode ? 'compact' : 'default';

  const itemInput = (
    <MultiItemFieldInputRow
      spacing={inputSpacing}
      hasPadding={shouldShowInputInFooter && shouldShowItems}
      rightComponent={
        isNonEmptyArray(emails) ? (
          <MultiItemFieldSaveButton
            isAddingNewItem={!isDefined(editedItemIndex)}
            onClick={handleInputEnter}
          />
        ) : undefined
      }
    >
      <MultiItemFieldTextInput
        autoFocus
        spacing={inputSpacing}
        placeholder={t`Email`}
        value={inputValue}
        hasError={hasError}
        onChange={handleInputChange}
        onEnter={handleInputEnter}
        onEscape={handleEscape}
        shouldPreventTabNavigation
      />
    </MultiItemFieldInputRow>
  );

  return (
    <MultiItemFieldList
      ref={containerRef}
      hasItems={shouldShowItems}
      shouldShowSearch={shouldShowSearch && !isInputOpen}
      searchFilter={searchFilter}
      onSearchFilterChange={setSearchFilter}
      footerInput={shouldShowInputInFooter ? itemInput : undefined}
      addButton={
        !shouldShowInputInFooter && !isLimitReached ? (
          <MultiItemFieldAddButton
            label={t`Add Email`}
            onClick={handleAddClick}
          />
        ) : undefined
      }
    >
      {visibleItemEntries?.map(({ item: email, index }, position, entries) =>
        index === editedItemIndex && isEditingItemInPlace ? (
          <MultiItemFieldEditedItem
            key={index}
            hasSeparatorBefore={position > 0}
            hasSeparatorAfter={position < entries.length - 1}
          >
            {itemInput}
          </MultiItemFieldEditedItem>
        ) : (
          <EmailsFieldMenuItem
            key={index}
            dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
            showPrimaryIcon={index === 0 && emails.length > 1}
            showSetAsPrimaryButton={index > 0}
            showCopyButton={true}
            email={email}
            onEdit={() => startEditingItem({ itemIndex: index })}
            onSetAsPrimary={() => handleSetAsPrimary(index)}
            onDelete={() => handleDelete(index)}
            onCopy={handleCopy}
          />
        ),
      )}
    </MultiItemFieldList>
  );
};
