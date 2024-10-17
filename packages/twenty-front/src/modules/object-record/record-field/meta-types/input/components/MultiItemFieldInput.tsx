import styled from '@emotion/styled';
import React, { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { IconCheck, IconPlus } from 'twenty-ui';

import { PhoneRecord } from '@/object-record/record-field/types/FieldMetadata';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import {
  DropdownMenuInput,
  DropdownMenuInputProps,
} from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

const StyledDropdownMenu = styled(DropdownMenu)`
  left: -1px;
  position: absolute;
  top: -1px;
`;

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
  renderInput?: DropdownMenuInputProps['renderInput'];
};

// Todo: the API of this component does not look healthy: we have renderInput, renderItem, formatInput, ...
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
}: MultiItemFieldInputProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleDropdownClose = () => {
    onCancel?.();
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: handleDropdownClose,
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

    if (errorData.isValid) {
      setErrorData(errorData);
    }
  };

  const handleAddButtonClick = () => {
    setItemToEditIndex(-1);
    setIsInputDisplayed(true);
  };

  const handleEditButtonClick = (index: number) => {
    let item;
    switch (fieldMetadataType) {
      case FieldMetadataType.Links:
        item = items[index] as { label: string; url: string };
        setInputValue(item.url || '');
        break;
      case FieldMetadataType.Phones:
        item = items[index] as PhoneRecord;
        setInputValue(item.countryCode + item.number);
        break;
      case FieldMetadataType.Emails:
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
        setErrorData(validationData);
        return;
      }
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
    <StyledDropdownMenu ref={containerRef} width={200}>
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
        <DropdownMenuInput
          autoFocus
          placeholder={placeholder}
          value={inputValue}
          hotkeyScope={hotkeyScope}
          hasError={!errorData.isValid}
          renderInput={
            renderInput
              ? (props) =>
                  renderInput({
                    ...props,
                    onChange: (newValue) =>
                      setInputValue(newValue as unknown as string),
                  })
              : undefined
          }
          onChange={(event) =>
            handleOnChange(
              turnIntoEmptyStringIfWhitespacesOnly(event.target.value),
            )
          }
          onEnter={handleSubmitInput}
          rightComponent={
            <LightIconButton
              Icon={isAddingNewItem ? IconPlus : IconCheck}
              onClick={handleSubmitInput}
            />
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
    </StyledDropdownMenu>
  );
};
