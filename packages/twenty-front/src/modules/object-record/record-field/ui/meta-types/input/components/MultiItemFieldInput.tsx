import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { useDebounce } from 'use-debounce';

import {
  MultiItemBaseInput,
  type MultiItemBaseInputProps,
} from '@/object-record/record-field/ui/meta-types/input/components/MultiItemBaseInput';
import { useMultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type PhoneRecord } from '@/object-record/record-field/ui/types/FieldMetadata';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { currentFocusedItemSelector } from '@/ui/utilities/focus/states/currentFocusedItemSelector';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CustomError } from 'twenty-shared/utils';
import { IconCheck, IconPlus } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type MultiItemFieldInputProps<T> = {
  items: T[];
  onChange: (newItemsValue: T[]) => void;
  onEscape: (newItemsValue: T[]) => void;
  onEnter: (newItemsValue: T[]) => void;
  onClickOutside: (newItemsValue: T[], event: MouseEvent | TouchEvent) => void;
  onError?: (hasError: boolean, values: any[]) => void;
  placeholder: string;
  validateInput?: (input: string) => { isValid: boolean; errorMessage: string };
  formatInput?: (input: string, itemIndex?: number) => T;
  renderItem: (props: {
    value: T;
    index: number;
    handleEdit: () => void;
    handleSetPrimary: () => void;
    handleDelete: () => void;
  }) => React.ReactNode;
  newItemLabel?: string;
  onAddClick?: () => void;
  fieldMetadataType: FieldMetadataType;
  renderInput?: MultiItemBaseInputProps['renderInput'];
  maxItemCount?: number;
};

export const MultiItemFieldInput = <T,>({
  items,
  onChange,
  onEscape,
  onEnter,
  onError,
  placeholder,
  validateInput,
  formatInput,
  renderItem,
  newItemLabel,
  onAddClick,
  fieldMetadataType,
  renderInput,
  onClickOutside,
  maxItemCount,
}: MultiItemFieldInputProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const currentFocusedItem = useAtomStateValue(currentFocusedItemSelector);

  const getItemValueAsString = useCallback(
    (index: number): string => {
      if (index >= items.length) {
        return '';
      }

      let item;
      switch (fieldMetadataType) {
        case FieldMetadataType.LINKS:
          item = items[index] as { label: string; url: string };
          return item.url || '';
        case FieldMetadataType.PHONES:
          item = items[index] as PhoneRecord;
          return item.callingCode + item.number;
        case FieldMetadataType.EMAILS:
          item = items[index] as string;
          return item;
        case FieldMetadataType.ARRAY:
          item = items[index] as string;
          return item;
        case FieldMetadataType.FILES:
          item = items[index] as { label: string };
          return item.label || '';
        default:
          throw new CustomError(
            `Unsupported field type: ${fieldMetadataType}`,
            'UNSUPPORTED_FIELD_TYPE',
          );
      }
    },
    [items, fieldMetadataType],
  );

  const {
    isInputDisplayed,
    inputValue,
    isAddingNewItem,
    errorData,
    isLimitReached,
    handleInputChange,
    handleAddButtonClick,
    handleEditButtonClick,
    handleEnter,
    handleSetPrimaryItem,
    handleDeleteItem,
    validateInputAndComputeUpdatedItems,
  } = useMultiItemFieldInput({
    items,
    onChange,
    onEnter,
    onError,
    validateInput,
    formatInput,
    getItemValueAsString,
    maxItemCount,
    onAddClick,
  });

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      if (
        currentFocusedItem?.componentInstance.componentType !==
        FocusComponentType.OPENED_FIELD_INPUT
      ) {
        return;
      }

      if (isInputDisplayed) {
        const { isValid, updatedItems } = validateInputAndComputeUpdatedItems();

        if (!isValid) {
          return;
        }

        onChange(updatedItems);
        onClickOutside(updatedItems, event);

        return;
      }

      onClickOutside(items, event);
    },
    listenerId: instanceId,
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [debouncedSearchFilter] = useDebounce(searchFilter, 150);

  const shouldShowSearch = items.length > 3;

  const filteredItems = useMemo(() => {
    if (!shouldShowSearch || !debouncedSearchFilter) {
      return items;
    }
    const searchTerm = normalizeSearchText(debouncedSearchFilter);
    return items.filter((_item, index) => {
      const itemText = getItemValueAsString(index);
      return normalizeSearchText(itemText).includes(searchTerm);
    });
  }, [items, debouncedSearchFilter, shouldShowSearch, getItemValueAsString]);

  const shouldAutoEnterBecauseOnlyOneItemIsAllowed = maxItemCount === 1;

  const handleEscape = () => {
    onEscape(items);
  };

  useHotkeysOnFocusedElement({
    focusId: instanceId,
    keys: [Key.Escape],
    callback: handleEscape,
    dependencies: [handleEscape],
  });

  return (
    <DropdownContent ref={containerRef}>
      {shouldShowSearch && !isInputDisplayed && (
        <>
          <DropdownMenuSearchInput
            value={searchFilter}
            onChange={(event) =>
              setSearchFilter(
                turnIntoEmptyStringIfWhitespacesOnly(event.currentTarget.value),
              )
            }
            autoFocus
          />
          <DropdownMenuSeparator />
        </>
      )}
      {!!filteredItems.length &&
        (!shouldAutoEnterBecauseOnlyOneItemIsAllowed || !isInputDisplayed) && (
          <>
            <DropdownMenuItemsContainer hasMaxHeight>
              {filteredItems.map((item) => {
                const originalIndex = items.indexOf(item);
                return renderItem({
                  value: item,
                  index: originalIndex,
                  handleEdit: () => handleEditButtonClick(originalIndex),
                  handleSetPrimary: () => handleSetPrimaryItem(originalIndex),
                  handleDelete: () => {
                    handleDeleteItem(originalIndex);
                  },
                });
              })}
            </DropdownMenuItemsContainer>
            {isInputDisplayed || !isLimitReached ? (
              <DropdownMenuSeparator />
            ) : null}
          </>
        )}
      {isInputDisplayed ? (
        <MultiItemBaseInput
          instanceId={instanceId}
          autoFocus={!shouldShowSearch}
          placeholder={placeholder}
          value={inputValue}
          hasError={!errorData.isValid}
          renderInput={renderInput}
          onEscape={handleEscape}
          onChange={(value) => {
            value
              ? handleInputChange(turnIntoEmptyStringIfWhitespacesOnly(value))
              : handleInputChange('');
          }}
          onEnter={handleEnter}
          hasItem={!!items.length}
          rightComponent={
            items.length ? (
              <LightIconButton
                Icon={isAddingNewItem ? IconPlus : IconCheck}
                onClick={handleEnter}
              />
            ) : null
          }
        />
      ) : !isLimitReached ? (
        <DropdownMenuItemsContainer>
          <MenuItem
            onClick={handleAddButtonClick}
            LeftIcon={IconPlus}
            text={newItemLabel || `Add ${placeholder}`}
          />
        </DropdownMenuItemsContainer>
      ) : null}
    </DropdownContent>
  );
};
