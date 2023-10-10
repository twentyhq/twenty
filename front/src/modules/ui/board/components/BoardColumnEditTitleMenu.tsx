import { ChangeEvent, useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { IconTrash } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemSelectColor } from '@/ui/menu-item/components/MenuItemSelectColor';
import { ThemeColor } from '@/ui/theme/constants/colors';
import { textInputStyle } from '@/ui/theme/constants/effects';
import { debounce } from '~/utils/debounce';

import { boardColumnsState } from '../states/boardColumnsState';

const StyledEditTitleContainer = styled.div`
  --vertical-padding: ${({ theme }) => theme.spacing(1)};

  align-items: center;

  display: flex;
  flex-direction: row;
  height: calc(36px - 2 * var(--vertical-padding));
  padding: var(--vertical-padding) 0;

  width: calc(100%);
`;

const StyledEditModeInput = styled.input`
  ${textInputStyle}

  background: ${({ theme }) => theme.background.transparent.lighter};
  border-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-style: solid;
  border-width: 1px;
  box-shadow: 0px 0px 0px 3px rgba(25, 97, 237, 0.1);
  font-size: ${({ theme }) => theme.font.size.sm};
  height: 100%;
  width: 100%;
`;

export type BoardColumnEditTitleMenuProps = {
  onClose: () => void;
  onDelete?: (id: string) => void;
  title: string;
  onTitleEdit: (title: string, color: string) => void;
  color: ThemeColor;
  stageId: string;
};

type ColumnColorOption = {
  name: string;
  id: ThemeColor;
};

export const COLUMN_COLOR_OPTIONS: ColumnColorOption[] = [
  { name: 'Green', id: 'green' },
  { name: 'Turquoise', id: 'turquoise' },
  { name: 'Sky', id: 'sky' },
  { name: 'Blue', id: 'blue' },
  { name: 'Purple', id: 'purple' },
  { name: 'Pink', id: 'pink' },
  { name: 'Red', id: 'red' },
  { name: 'Orange', id: 'orange' },
  { name: 'Yellow', id: 'yellow' },
  { name: 'Gray', id: 'gray' },
];

export const BoardColumnEditTitleMenu = ({
  onClose,
  onDelete,
  stageId,
  onTitleEdit,
  title,
  color,
}: BoardColumnEditTitleMenuProps) => {
  const [internalValue, setInternalValue] = useState(title);
  const [, setBoardColumns] = useRecoilState(boardColumnsState);
  const debouncedOnUpdateTitle = debounce(
    (newTitle) => onTitleEdit(newTitle, color),
    200,
  );
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    setInternalValue(title);
    debouncedOnUpdateTitle(title);

    setBoardColumns((previousBoardColumns) =>
      previousBoardColumns.map((column) =>
        column.id === stageId ? { ...column, title: title } : column,
      ),
    );
  };

  const handleColorChange = (newColor: ThemeColor) => {
    onTitleEdit(title, newColor);
    onClose();
    setBoardColumns((previousBoardColumns) =>
      previousBoardColumns.map((column) =>
        column.id === stageId
          ? { ...column, colorCode: newColor ? newColor : 'gray' }
          : column,
      ),
    );
  };

  const handleDelete = useCallback(() => {
    setBoardColumns((previousBoardColumns) =>
      previousBoardColumns.filter((column) => column.id !== stageId),
    );
    onDelete?.(stageId);
    onClose();
  }, [onClose, onDelete, setBoardColumns, stageId]);

  return (
    <DropdownMenuItemsContainer>
      <StyledEditTitleContainer>
        <StyledEditModeInput
          value={internalValue}
          onChange={handleChange}
          autoComplete="off"
          autoFocus
        />
      </StyledEditTitleContainer>
      <StyledDropdownMenuSeparator />
      {COLUMN_COLOR_OPTIONS.map((colorOption) => (
        <MenuItemSelectColor
          key={colorOption.name}
          onClick={() => {
            handleColorChange(colorOption.id);
          }}
          color={colorOption.id}
          selected={colorOption.id === color}
          text={colorOption.name}
        />
      ))}
      <StyledDropdownMenuSeparator />
      <MenuItem
        onClick={handleDelete}
        LeftIcon={IconTrash}
        text="Delete"
        accent="danger"
      />
    </DropdownMenuItemsContainer>
  );
};
