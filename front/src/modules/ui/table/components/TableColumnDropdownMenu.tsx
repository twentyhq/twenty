import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { IconArrowLeft, IconArrowRight, IconEyeOff } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

import { ColumnHeadDropdownId } from '../constants/ColumnHeadDropdownId';
import { useTableColumns } from '../hooks/useTableColumns';
import { ColumnDefinition } from '../types/ColumnDefinition';

export type EntityTableHeaderOptionsProps = {
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
}: EntityTableHeaderOptionsProps) => {
  const { handleColumnVisibilityChange, handleMoveTableColumn } =
    useTableColumns();

  const { closeDropdownButton } = useDropdownButton({
    dropdownId: ColumnHeadDropdownId,
  });

  const handleColumnMoveLeft = () => {
    closeDropdownButton();
    if (isFirstColumn) {
      return;
    }
    handleMoveTableColumn('left', column);
  };

  const handleColumnMoveRight = () => {
    closeDropdownButton();
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
