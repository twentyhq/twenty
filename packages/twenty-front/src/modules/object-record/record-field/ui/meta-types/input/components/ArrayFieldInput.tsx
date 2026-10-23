import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useArrayField } from '@/object-record/record-field/ui/meta-types/hooks/useArrayField';
import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldSearchHeader } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSearchHeader';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useMultiItemDraft } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemDraft';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { arrayFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/arrayFieldValueSchema';
import { OverlayMenuList } from '@/ui/layout/overlay/components/OverlayMenuList';
import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
import { t } from '@lingui/core/macro';
import { useContext, useMemo, useRef } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const getArrayItemText = (item: string) => item;

export const ArrayFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useArrayField();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const arrayItems = useMemo<Array<string>>(
    () => (Array.isArray(draftValue) ? draftValue : []),
    [draftValue],
  );

  const parseStringArrayToArrayValue = (arrayItems: string[]) => {
    const parseResponse = arrayFieldValueSchema.safeParse(arrayItems);

    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handleChange = (updatedItems: string[]) => {
    const nextValue = parseStringArrayToArrayValue(updatedItems);

    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
    }
  };

  const handleSubmit = (updatedItems: string[]) => {
    onSubmit?.({
      newValue: parseStringArrayToArrayValue(updatedItems),
      skipClose: true,
    });
  };

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  const draft = useMultiItemDraft({
    items: arrayItems,
    getItemText: getArrayItemText,
    maxItemCount: maxNumberOfValues,
  });

  const {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  } = useMultiItemSearch({ items: arrayItems, getItemText: getArrayItemText });

  const handleInputEnter = () => {
    const { isValid, updatedItems } = draft.computeItemsFromInput();

    if (!isValid) {
      return;
    }

    handleChange(updatedItems);

    if (draft.isSingleItemMode) {
      onEnter?.({ newValue: parseStringArrayToArrayValue(updatedItems) });
    } else if (!isDeeplyEqual(arrayItems, updatedItems)) {
      handleSubmit(updatedItems);
    }

    draft.closeInput();
  };

  const handleEscape = () => {
    onEscape?.({ newValue: parseStringArrayToArrayValue(arrayItems) });
  };

  useMultiItemFieldDismiss({
    containerRef,
    onEscape: handleEscape,
    onClickOutside: (event) => {
      if (!draft.isInputDisplayed) {
        onClickOutside?.({
          newValue: parseStringArrayToArrayValue(arrayItems),
          event,
        });
        return;
      }

      const { isValid, updatedItems } = draft.computeItemsFromInput();

      if (!isValid) {
        return;
      }

      handleChange(updatedItems);
      onClickOutside?.({
        newValue: parseStringArrayToArrayValue(updatedItems),
        event,
      });
    },
  });

  const handleDelete = (index: number) => {
    const updatedItems = toSpliced(arrayItems, index, 1);

    handleChange(updatedItems);
    handleSubmit(updatedItems);
    draft.resetInputForItems(updatedItems);
  };

  const shouldShowItems =
    isNonEmptyArray(filteredItemEntries) &&
    (!draft.isSingleItemMode || !draft.isInputDisplayed);
  const shouldShowAddButton = !draft.isInputDisplayed && !draft.isLimitReached;

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
            (draft.isInputDisplayed || shouldShowAddButton) && (
              <OverlayMenuListSeparator />
            )}
          {draft.isInputDisplayed && (
            <MultiItemFieldInputRow
              rightComponent={
                isNonEmptyArray(arrayItems) ? (
                  <MultiItemFieldSaveButton
                    isAddingNewItem={draft.isAddingNewItem}
                    onClick={handleInputEnter}
                  />
                ) : undefined
              }
            >
              <MultiItemFieldTextInput
                autoFocus={!shouldShowSearch}
                placeholder={t`Enter value`}
                value={draft.inputValue}
                hasError={draft.hasError}
                onChange={draft.handleInputChange}
                onEnter={handleInputEnter}
                onEscape={handleEscape}
                preventTabNavigation
              />
            </MultiItemFieldInputRow>
          )}
          {shouldShowAddButton && (
            <MultiItemFieldAddButton
              label={t`Add Item`}
              onClick={draft.startAdding}
            />
          )}
        </>
      }
    >
      {shouldShowItems &&
        filteredItemEntries.map(({ item, index }) => (
          <ArrayFieldMenuItem
            key={index}
            dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
            value={item}
            onEdit={() => draft.startEditing(index)}
            onDelete={() => handleDelete(index)}
          />
        ))}
    </OverlayMenuList>
  );
};
