import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { IconArrowLeft, IconArrowRight, IconEyeOff } from '@/ui/display/icon';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { ColumnHeadDropdownId } from '../constants/ColumnHeadDropdownId';
import { useTableColumns } from '../hooks/useTableColumns';
import { ColumnDefinition } from '../types/ColumnDefinition';

export type DataTableColumnDropdownMenuProps = {
  column: ColumnDefinition<FieldMetadata>;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  primaryColumnKey: string;
};

export const DataTableColumnDropdownMenu = ({
  column,
  isFirstColumn,
  isLastColumn,
  primaryColumnKey,
}: DataTableColumnDropdownMenuProps) => {
  const { handleColumnVisibilityChange, handleMoveTableColumn } =
    useTableColumns();

  const { closeDropdown } = useDropdown({
    dropdownScopeId: ColumnHeadDropdownId,
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
    <DropdownMenu>
      <DropdownMenuItemsContainer>
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
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
