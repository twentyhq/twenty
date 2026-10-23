import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useEmailsField } from '@/object-record/record-field/ui/meta-types/hooks/useEmailsField';
import { EmailsFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/EmailsFieldMenuItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldSearchHeader } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSearchHeader';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useMultiItemDraft } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemDraft';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { emailsFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/emailsFieldValueSchema';
import { OverlayMenuList } from '@/ui/layout/overlay/components/OverlayMenuList';
import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useRef } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { emailSchema, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
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

  const draft = useMultiItemDraft({
    items: emails,
    onItemsChange: handleChange,
    getItemText: getEmailText,
    validateInput: validateEmail,
    maxItemCount: maxNumberOfValues,
    onError: (hasError) =>
      setRecordFieldInputIsFieldInError(hasError && emails.length === 0),
  });

  const {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  } = useMultiItemSearch({ items: emails, getItemText: getEmailText });

  const handleInputEnter = () => {
    const updatedItems = draft.commitInput();

    if (!isDefined(updatedItems)) {
      return;
    }

    if (draft.isSingleItemMode) {
      onEnter?.({ newValue: parseStringArrayToEmailsValue(updatedItems) });
    } else if (!isDeeplyEqual(emails, updatedItems)) {
      handleSubmit(updatedItems);
    }

    draft.closeInput();
  };

  const handleAddClick = () => {
    if (draft.isLimitReached) {
      return;
    }

    if (draft.isEditingItemInPlace) {
      const updatedItems = draft.commitInput();

      if (!isDefined(updatedItems)) {
        return;
      }

      if (!isDeeplyEqual(emails, updatedItems)) {
        handleSubmit(updatedItems);
      }
    }

    draft.startAdding();
  };

  const handleEscape = () => {
    onEscape?.({ newValue: parseStringArrayToEmailsValue(emails) });
  };

  useMultiItemFieldDismiss({
    containerRef,
    onEscape: handleEscape,
    onClickOutside: (event) => {
      const updatedItems = draft.isInputDisplayed
        ? draft.commitInput()
        : emails;

      if (!isDefined(updatedItems)) {
        return;
      }

      onClickOutside?.({
        newValue: parseStringArrayToEmailsValue(updatedItems),
        event,
      });
    },
  });

  const handleSetAsPrimary = (index: number) => {
    const updatedEmails = moveArrayItem(emails, {
      fromIndex: index,
      toIndex: 0,
    });

    handleChange(updatedEmails);
    handleSubmit(updatedEmails);
  };

  const handleDelete = (index: number) => {
    const updatedEmails = toSpliced(emails, index, 1);

    handleChange(updatedEmails);
    handleSubmit(updatedEmails);
    draft.resetInputForItems(updatedEmails);
  };

  const handleCopy = (email: string) => {
    copyToClipboard(email, t`Email copied to clipboard`);
  };

  const shouldShowItems =
    isNonEmptyArray(filteredItemEntries) &&
    (!draft.isSingleItemMode || !draft.isInputDisplayed);
  const visibleItemEntries = shouldShowItems ? filteredItemEntries : undefined;
  const visibleItemCount = visibleItemEntries?.length ?? 0;
  const shouldShowInputInFooter =
    draft.isInputDisplayed && !draft.isEditingItemInPlace;
  const shouldShowAddButton = !shouldShowInputInFooter && !draft.isLimitReached;
  const isInputInRow = isNonEmptyArray(emails) && !draft.isSingleItemMode;

  const itemInput = (
    <MultiItemFieldInputRow
      isInRow={isInputInRow}
      isInFooter={shouldShowInputInFooter}
      rightComponent={
        isNonEmptyArray(emails) ? (
          <MultiItemFieldSaveButton
            isAddingNewItem={draft.isAddingNewItem}
            onClick={handleInputEnter}
          />
        ) : undefined
      }
    >
      <MultiItemFieldTextInput
        autoFocus
        isInRow={isInputInRow}
        placeholder={t`Email`}
        value={draft.inputValue}
        hasError={draft.hasError}
        onChange={draft.handleInputChange}
        onEnter={handleInputEnter}
        onEscape={handleEscape}
        shouldPreventTabNavigation
      />
    </MultiItemFieldInputRow>
  );

  return (
    <OverlayMenuList
      ref={containerRef}
      header={
        shouldShowSearch && !draft.isInputDisplayed ? (
          <MultiItemFieldSearchHeader
            value={searchFilter}
            onChange={setSearchFilter}
          />
        ) : undefined
      }
      footer={
        <>
          {shouldShowItems &&
            (shouldShowInputInFooter || shouldShowAddButton) && (
              <OverlayMenuListSeparator />
            )}
          {shouldShowInputInFooter && itemInput}
          {shouldShowAddButton && (
            <MultiItemFieldAddButton
              label={t`Add Email`}
              onClick={handleAddClick}
            />
          )}
        </>
      }
    >
      {visibleItemEntries?.map(({ item: email, index }, position) =>
        draft.isEditingItemInPlace && index === draft.editedItemIndex ? (
          <MultiItemFieldEditedItem
            key={index}
            hasSeparatorBefore={position > 0}
            hasSeparatorAfter={position < visibleItemCount - 1}
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
            onEdit={() => draft.startEditing(index)}
            onSetAsPrimary={() => handleSetAsPrimary(index)}
            onDelete={() => handleDelete(index)}
            onCopy={handleCopy}
          />
        ),
      )}
    </OverlayMenuList>
  );
};
