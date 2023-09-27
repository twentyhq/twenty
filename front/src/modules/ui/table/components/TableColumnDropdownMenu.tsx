import React from 'react';
import { useScopedHotkeys } from '@/path/to/useScopedHotkeys'; // Adjust the path as per your project's structure
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { IconArrowLeft, IconArrowRight, IconEyeOff } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

import { ColumnHeadDropdownId } from '../constants/ColumnHeadDropdownId';
import { useTableColumns } from '../hooks/useTableColumns';
import { ColumnDefinition } from '../types/ColumnDefinition';

export type EntityTableHeaderOptionsProps = {
  column: ColumnDefinition<ViewFieldMetadata>;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  primaryColumnKey: string;
};

export const TableColumnDropdownMenu = ({
  column,
  isFirstColumn,
  isLastColumn,
  primaryColumnKey,
}: EntityTableHeaderOptionsProps) => {
  const {
    handleColumnVisibilityChange,
    handleColumnLeftMove,
    handleColumnRightMove,
  } = useTableColumns();

  const { closeDropdownButton } = useDropdownButton({
    dropdownId: ColumnHeadDropdownId,
  });

  const handleColumnMoveLeft = () => {
    closeDropdownButton();
    if (isFirstColumn) {
      return;
    }
    handleColumnLeftMove(column);
  };

  const handleColumnMoveRight = () => {
    closeDropdownButton();
    if (isLastColumn) {
      return;
    }
    handleColumnRightMove(column);
  };

  const handleColumnVisibility = () => {
    handleColumnVisibilityChange(column);
  };

  const handleEscapeKey = () => {
    closeDropdownButton();
  };

  useScopedHotkeys(
    'Escape', // Listen for the Escape key
    handleEscapeKey,
    AppHotkeyScope.CommandMenu // Replace with the appropriate hotkey scope
  );

  return column.key === primaryColumnKey ? (
    <></>
  ) : (
    <StyledDropdownMenu>
      <StyledDropdownMenuItemsContainer>
        {!isFirstColumn && (
          <MenuItem
            LeftIcon={IconArrowLeft}
            onClick={handleColumnMoveLeft}
            text="Move left"
          />
        )}
        {!isLastColumn && (
          <MenuItem
            LeftIcon={IconArrowRight}
            onClick={handleColumnMoveRight}
            text="Move right"
          />
        )}
        <MenuItem
          LeftIcon={IconEyeOff}
          onClick={handleColumnVisibility}
          text="Hide"
        />
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  );
};
