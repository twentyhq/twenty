import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { IconCheck, IconPlus } from 'twenty-ui';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';

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
  validateInput?: (input: string) => boolean;
  formatInput?: (input: string) => T;
  renderItem: (props: {
    value: T;
    index: number;
    handleEdit: () => void;
    handleSetPrimary: () => void;
    handleDelete: () => void;
  }) => React.ReactNode;
  hotkeyScope: string;
};

export const MultiItemFieldInput = <T,>({
  items,
  onPersist,
  onCancel,
  placeholder,
  validateInput,
  formatInput,
  renderItem,
  hotkeyScope,
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
  const isAddingNewItem = itemToEditIndex === -1;

  const handleAddButtonClick = () => {
    setItemToEditIndex(-1);
    setIsInputDisplayed(true);
  };

  const handleEditButtonClick = (index: number) => {
    setItemToEditIndex(index);
    setInputValue((items[index] as unknown as string) || '');
    setIsInputDisplayed(true);
  };

  const handleSubmitInput = () => {
    if (validateInput !== undefined && !validateInput(inputValue)) return;

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
          onChange={(event) => setInputValue(event.target.value)}
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
            text={`Add ${placeholder}`}
          />
        </DropdownMenuItemsContainer>
      )}
    </StyledDropdownMenu>
  );
};
