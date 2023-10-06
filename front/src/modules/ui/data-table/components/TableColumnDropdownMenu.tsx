import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';
import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { IconArrowLeft, IconArrowRight, IconEyeOff } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

import { ColumnHeadDropdownId } from '../constants/ColumnHeadDropdownId';
import { useTableColumns } from '../hooks/useTableColumns';
import { ColumnDefinition } from '../types/ColumnDefinition';

export type TableColumnDropdownMenuProps = {
  column: ColumnDefinition<FieldMetadata>;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  primaryColumnKey: string;
};

export const TableColumnDropdownMenu = ({
  column,
  isFirstColumn,
  isLastColumn,
  primaryColumnKey,
}: TableColumnDropdownMenuProps) => {
  const { handleColumnVisibilityChange, handleMoveTableColumn } =
    useTableColumns();

  const { closeDropdown } = useDropdown({
    dropdownId: ColumnHeadDropdownId,
  });

  const handleColumnMoveLeft = () => {
    closeDropdown();
    if (isFirstColumn) {
      return;
    }
    handleMoveTableColumn('left', column);
  };

  const handleColumnMoveRight = () => {
    closeDropdown();
    if (isLastColumn) {
      return;
    }
    handleMoveTableColumn('right', column);
  };

  const handleColumnVisibility = () => {
    handleColumnVisibilityChange(column);
  };

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
