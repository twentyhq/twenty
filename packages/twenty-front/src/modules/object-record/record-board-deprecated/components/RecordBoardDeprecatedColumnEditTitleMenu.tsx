import { ChangeEvent, useCallback, useContext, useState } from 'react';
import styled from '@emotion/styled';

import { IconTrash } from '@/ui/display/icon';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelectColor } from '@/ui/navigation/menu-item/components/MenuItemSelectColor';
import { mainColorNames, ThemeColor } from '@/ui/theme/constants/colors';
import { textInputStyle } from '@/ui/theme/constants/effects';
import { debounce } from '~/utils/debounce';

import { BoardColumnContext } from '../contexts/BoardColumnContext';
import { useRecordBoardDeprecated } from '../hooks/useRecordBoardDeprecated';

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

type RecordBoardDeprecatedColumnEditTitleMenuProps = {
  onClose: () => void;
  onDelete?: (id: string) => void;
  title: string;
  color: ThemeColor;
  stageId: string;
};

export const RecordBoardDeprecatedColumnEditTitleMenu = ({
  onClose,
  onDelete,
  stageId,
  title,
  color,
}: RecordBoardDeprecatedColumnEditTitleMenuProps) => {
  const [internalValue, setInternalValue] = useState(title);
  const { onTitleEdit } = useContext(BoardColumnContext) || {};

  const { setBoardColumns } = useRecordBoardDeprecated({
    recordBoardScopeId: 'company-board',
  });

  const debouncedOnUpdateTitle = debounce(
    (newTitle) => onTitleEdit?.({ title: newTitle, color }),
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
    onTitleEdit?.({ title, color: newColor });
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
      <DropdownMenuSeparator />
      {mainColorNames.map((colorName) => (
        <MenuItemSelectColor
          key={colorName}
          onClick={() => handleColorChange(colorName)}
          color={colorName}
          selected={colorName === color}
          variant="pipeline"
        />
      ))}
      <DropdownMenuSeparator />
      <MenuItem
        onClick={handleDelete}
        LeftIcon={IconTrash}
        text="Delete"
        accent="danger"
      />
    </DropdownMenuItemsContainer>
  );
};
