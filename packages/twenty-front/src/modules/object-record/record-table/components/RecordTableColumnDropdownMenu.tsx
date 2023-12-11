import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { IconArrowLeft, IconArrowRight, IconEyeOff } from '@/ui/display/icon';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { useTableColumns } from '../hooks/useTableColumns';
import { ColumnDefinition } from '../types/ColumnDefinition';

export type RecordTableColumnDropdownMenuProps = {
  column: ColumnDefinition<FieldMetadata>;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  primaryColumnKey: string;
};

export const RecordTableColumnDropdownMenu = ({
  column,
  isFirstColumn,
  isLastColumn,
  primaryColumnKey,
}: RecordTableColumnDropdownMenuProps) => {
  const { handleColumnVisibilityChange, handleMoveTableColumn } =
    useTableColumns();

  const { closeDropdown } = useDropdown();

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
    closeDropdown();
    handleColumnVisibilityChange(column);
  };

  return column.fieldMetadataId === primaryColumnKey ? (
    <></>
  ) : (
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
  );
};
