import React, { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';

import {
  MultiItemBaseInput,
  type MultiItemBaseInputProps,
} from '@/object-record/record-field/ui/meta-types/input/components/MultiItemBaseInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type PhoneRecord } from '@/object-record/record-field/ui/types/FieldMetadata';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { CustomError } from 'twenty-shared/utils';
import { IconCheck, IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type MultiItemFieldInputProps<T> = {
  items: T[];
  onChange: (newItemsValue: T[]) => void;
  onEscape?: (newItemsValue: T[]) => void;
  placeholder: string;
  validateInput?: (input: string) => { isValid: boolean; errorMessage: string };
  formatInput?: (input: string) => T;
  renderItem: (props: {
    value: T;
    index: number;
    handleEdit: () => void;
    handleSetPrimary: () => void;
    handleDelete: () => void;
  }) => React.ReactNode;
  newItemLabel?: string;
  fieldMetadataType: FieldMetadataType;
  renderInput?: MultiItemBaseInputProps['renderInput'];
  onClickOutside?: (newItemsValue: T[], event: MouseEvent | TouchEvent) => void;
  onError?: (hasError: boolean, values: any[]) => void;
};

// Todo: the API of this component does not look healthy: we have renderInput, renderItem, formatInput, ...
// This should be refactored with a hook instead that exposes those events in a context around this component and its children.
export const MultiItemFieldInput = <T,>({
  items,
  onChange,
  onEscape,
  placeholder,
  validateInput,
  formatInput,
  renderItem,
  newItemLabel,
  fieldMetadataType,
  renderInput,
  onClickOutside,
  onError,
}: MultiItemFieldInputProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEscape = () => {
    onEscape?.(items);
  };

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      const isEditing = inputValue !== '';
      const isPrimaryItem = items.length === 0;

      if (isEditing && isPrimaryItem) {
        handleSubmitInput();
      }

      onClickOutside?.(items, event);
    },
    listenerId: instanceId,
  });

  useHotkeysOnFocusedElement({
    focusId: instanceId,
    keys: [Key.Escape],
    callback: handleEscape,
    dependencies: [handleEscape],
  });

  const [isInputDisplayed, setIsInputDisplayed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [itemToEditIndex, setItemToEditIndex] = useState(-1);
  const [errorData, setErrorData] = useState({
    isValid: true,
    errorMessage: '',
  });
  const isAddingNewItem = itemToEditIndex === -1;

  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (!validateInput) return;

    setErrorData(
      errorData.isValid ? errorData : { isValid: true, errorMessage: '' },
    );

    onError?.(false, items);
  };

  const handleAddButtonClick = () => {
    setItemToEditIndex(-1);
    setIsInputDisplayed(true);
  };

  const handleEditButtonClick = (index: number) => {
    let item;
    switch (fieldMetadataType) {
      case FieldMetadataType.LINKS:
        item = items[index] as { label: string; url: string };
        setInputValue(item.url || '');
        break;
      case FieldMetadataType.PHONES:
        item = items[index] as PhoneRecord;
        setInputValue(item.callingCode + item.number);
        break;
      case FieldMetadataType.EMAILS:
        item = items[index] as string;
        setInputValue(item);
        break;
      case FieldMetadataType.ARRAY:
        item = items[index] as string;
        setInputValue(item);
        break;
      default:
        throw new CustomError(
          `Unsupported field type: ${fieldMetadataType}`,
          'UNSUPPORTED_FIELD_TYPE',
        );
    }

    setItemToEditIndex(index);
    setIsInputDisplayed(true);
  };

  const handleSubmitInput = () => {
    const sanitizedInput = inputValue.trim();
    if (validateInput !== undefined) {
      const validationData = validateInput(sanitizedInput) ?? { isValid: true };
      if (!validationData.isValid) {
        onError?.(true, items);
        setErrorData(validationData);
        return;
      }
    }

    if (sanitizedInput === '' && isAddingNewItem) {
      return;
    }

    if (sanitizedInput === '' && !isAddingNewItem) {
      handleDeleteItem(itemToEditIndex);
      return;
    }

    const newItem = formatInput
      ? formatInput(sanitizedInput)
      : (sanitizedInput as unknown as T);

    if (!isAddingNewItem && newItem === items[itemToEditIndex]) {
      setIsInputDisplayed(false);
      setInputValue('');
      return;
    }

    const updatedItems = isAddingNewItem
      ? [...items, newItem]
      : toSpliced(items, itemToEditIndex, 1, newItem);

    onChange(updatedItems);
    setIsInputDisplayed(false);
    setInputValue('');
  };

  const handleSetPrimaryItem = (index: number) => {
    const updatedItems = moveArrayItem(items, { fromIndex: index, toIndex: 0 });
    onChange(updatedItems);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = toSpliced(items, index, 1);
    onChange(updatedItems);
  };

  return (
    <DropdownContent ref={containerRef}>
      {!!items.length && (
        <>
          <DropdownMenuItemsContainer hasMaxHeight>
            {items.map((item, index) =>
              renderItem({
                value: item,
                index,
                handleEdit: () => handleEditButtonClick(index),
                handleSetPrimary: () => handleSetPrimaryItem(index),
                handleDelete: () => handleDeleteItem(index),
              }),
            )}
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}
      {isInputDisplayed || !items.length ? (
        <MultiItemBaseInput
          instanceId={instanceId}
          autoFocus
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
          onEnter={handleSubmitInput}
          hasItem={!!items.length}
          rightComponent={
            items.length ? (
              <LightIconButton
                Icon={isAddingNewItem ? IconPlus : IconCheck}
                onClick={handleSubmitInput}
              />
            ) : null
          }
        />
      ) : (
        <DropdownMenuItemsContainer>
          <MenuItem
            onClick={handleAddButtonClick}
            LeftIcon={IconPlus}
            text={newItemLabel || `Add ${placeholder}`}
          />
        </DropdownMenuItemsContainer>
      )}
    </DropdownContent>
  );
};
