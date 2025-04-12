import React, { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';

import {
  MultiItemBaseInput,
  MultiItemBaseInputProps,
} from '@/object-record/record-field/meta-types/input/components/MultiItemBaseInput';
import { FieldInputClickOutsideEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { PhoneRecord } from '@/object-record/record-field/types/FieldMetadata';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { IconCheck, IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type MultiItemFieldInputProps<T> = {
  items: T[];
  onPersist: (updatedItems: T[]) => void;
  onCancel?: () => void;
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
  hotkeyScope: string;
  newItemLabel?: string;
  fieldMetadataType: FieldMetadataType;
  renderInput?: MultiItemBaseInputProps['renderInput'];
  onClickOutside?: FieldInputClickOutsideEvent;
  onError?: (hasError: boolean, values: any[]) => void;
};

// Todo: the API of this component does not look healthy: we have renderInput, renderItem, formatInput, ...
// This should be refactored with a hook instead that exposes those events in a context around this component and its children.
export const MultiItemFieldInput = <T,>({
  items,
  onPersist,
  onCancel,
  placeholder,
  validateInput,
  formatInput,
  renderItem,
  hotkeyScope,
  newItemLabel,
  fieldMetadataType,
  renderInput,
  onClickOutside,
  onError,
}: MultiItemFieldInputProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleDropdownClose = () => {
    onCancel?.();
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      const isEditing = inputValue !== '';
      const isPrimaryItem = items.length === 0;

      if (isEditing && isPrimaryItem) {
        handleSubmitInput();
      }
      onClickOutside?.(() => {}, event);
    },
    listenerId: hotkeyScope,
  });

  useScopedHotkeys(Key.Escape, handleDropdownClose, hotkeyScope);

  const [isInputDisplayed, setIsInputDisplayed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [itemToEditIndex, setItemToEditIndex] = useState(-1);
  const [errorData, setErrorData] = useState({
    isValid: true,
    errorMessage: '',
  });
  const isAddingNewItem = itemToEditIndex === -1;

  const handleOnChange = (value: string) => {
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
        throw new Error(`Unsupported field type: ${fieldMetadataType}`);
    }

    setItemToEditIndex(index);
    setIsInputDisplayed(true);
  };

  const handleSubmitInput = () => {
    if (validateInput !== undefined) {
      const validationData = validateInput(inputValue) ?? { isValid: true };
      if (!validationData.isValid) {
        onError?.(true, items);
        setErrorData(validationData);
        return;
      }
    }

    if (inputValue === '' && isAddingNewItem) {
      return;
    }

    if (inputValue === '' && !isAddingNewItem) {
      handleDeleteItem(itemToEditIndex);
      return;
    }

    const newItem = formatInput
      ? formatInput(inputValue)
      : (inputValue as unknown as T);

    if (!isAddingNewItem && newItem === items[itemToEditIndex]) {
      setIsInputDisplayed(false);
      setInputValue('');
      return;
    }

    const updatedItems = isAddingNewItem
      ? [...items, newItem]
      : toSpliced(items, itemToEditIndex, 1, newItem);

    onPersist(updatedItems);
    setIsInputDisplayed(false);
    setInputValue('');
  };

  const handleSetPrimaryItem = (index: number) => {
    const updatedItems = moveArrayItem(items, { fromIndex: index, toIndex: 0 });
    onPersist(updatedItems);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = toSpliced(items, index, 1);
    onPersist(updatedItems);
  };

  return (
    <DropdownMenu ref={containerRef}>
      {!!items.length && (
        <>
          <DropdownMenuItemsContainer>
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
          autoFocus
          placeholder={placeholder}
          value={inputValue}
          hotkeyScope={hotkeyScope}
          hasError={!errorData.isValid}
          renderInput={renderInput}
          onEscape={handleDropdownClose}
          onChange={(value) => {
            value
              ? handleOnChange(turnIntoEmptyStringIfWhitespacesOnly(value))
              : handleOnChange('');
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
    </DropdownMenu>
  );
};
