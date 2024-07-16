import { useRecoilValue } from 'recoil';
import {
  IconArrowLeft,
  IconArrowRight,
  IconEyeOff,
  IconFilter,
  IconSortDescending,
} from 'twenty-ui';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { useTableColumns } from '../../hooks/useTableColumns';
import { ColumnDefinition } from '../../types/ColumnDefinition';

export type RecordTableColumnHeadDropdownMenuProps = {
  column: ColumnDefinition<FieldMetadata>;
};

export const RecordTableColumnHeadDropdownMenu = ({
  column,
}: RecordTableColumnHeadDropdownMenuProps) => {
  const {
    visibleTableColumnsSelector,
    onToggleColumnFilterState,
    onToggleColumnSortState,
  } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  const secondVisibleColumn = visibleTableColumns[1];
  const canMove = column.isLabelIdentifier !== true;
  const canMoveLeft =
    column.fieldMetadataId !== secondVisibleColumn?.fieldMetadataId && canMove;

  const lastVisibleColumn = visibleTableColumns[visibleTableColumns.length - 1];
  const canMoveRight =
    column.fieldMetadataId !== lastVisibleColumn?.fieldMetadataId && canMove;

  const { handleColumnVisibilityChange, handleMoveTableColumn } =
    useTableColumns();

  const { closeDropdown } = useDropdown(column.fieldMetadataId + '-header');

  const handleColumnMoveLeft = () => {
    closeDropdown();

    if (!canMoveLeft) return;

    handleMoveTableColumn('left', column);
  };

  const handleColumnMoveRight = () => {
    closeDropdown();

    if (!canMoveRight) return;

    handleMoveTableColumn('right', column);
  };

  const handleColumnVisibility = () => {
    closeDropdown();
    handleColumnVisibilityChange(column);
  };

  const onToggleColumnFilter = useRecoilValue(onToggleColumnFilterState);
  const onToggleColumnSort = useRecoilValue(onToggleColumnSortState);

  const handleSortClick = () => {
    closeDropdown();

    onToggleColumnSort?.(column.fieldMetadataId);
  };

  const handleFilterClick = () => {
    closeDropdown();

    onToggleColumnFilter?.(column.fieldMetadataId);
  };

  const isSortable = column.isSortable === true;
  const isFilterable = column.isFilterable === true;
  const showSeparator =
    (isFilterable || isSortable) && column.isLabelIdentifier !== true;
  const canHide = column.isLabelIdentifier !== true;

  return (
    <DropdownMenuItemsContainer>
      {isFilterable && (
        <MenuItem
          LeftIcon={IconFilter}
          onClick={handleFilterClick}
          text="Filter"
        />
      )}
      {isSortable && (
        <MenuItem
          LeftIcon={IconSortDescending}
          onClick={handleSortClick}
          text="Sort"
        />
      )}
      {showSeparator && <DropdownMenuSeparator />}
      {canMoveLeft && (
        <MenuItem
          LeftIcon={IconArrowLeft}
          onClick={handleColumnMoveLeft}
          text="Move left"
        />
      )}
      {canMoveRight && (
        <MenuItem
          LeftIcon={IconArrowRight}
          onClick={handleColumnMoveRight}
          text="Move right"
        />
      )}
      {canHide && (
        <MenuItem
          LeftIcon={IconEyeOff}
          onClick={handleColumnVisibility}
          text="Hide"
        />
      )}
    </DropdownMenuItemsContainer>
  );
};
