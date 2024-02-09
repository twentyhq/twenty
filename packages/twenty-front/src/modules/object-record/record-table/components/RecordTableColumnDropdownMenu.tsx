import { useRecoilValue } from 'recoil';

import { useObjectSortDropdown } from '@/object-record/object-sort-dropdown/components/useObjectSortDropdown';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import {
  IconArrowLeft,
  IconArrowRight,
  IconEyeOff,
  IconFilter,
  IconSortDescending,
} from '@/ui/display/icon';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { useTableColumns } from '../hooks/useTableColumns';
import { ColumnDefinition } from '../types/ColumnDefinition';

export type RecordTableColumnDropdownMenuProps = {
  column: ColumnDefinition<FieldMetadata>;
};

export const RecordTableColumnDropdownMenu = ({
  column,
}: RecordTableColumnDropdownMenuProps) => {
  const { getVisibleTableColumnsSelector } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(getVisibleTableColumnsSelector());
  const secondVisibleColumn = visibleTableColumns[1];
  const canMoveLeft =
    column.fieldMetadataId !== secondVisibleColumn?.fieldMetadataId;

  const lastVisibleColumn = visibleTableColumns[visibleTableColumns.length - 1];
  const canMoveRight =
    column.fieldMetadataId !== lastVisibleColumn?.fieldMetadataId;

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

  const { toggleSortDropdown } = useObjectSortDropdown();

  const handleSortClick = () => {
    closeDropdown();
    toggleSortDropdown();
  };

  return (
    <DropdownMenuItemsContainer>
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
      <MenuItem
        LeftIcon={IconEyeOff}
        onClick={handleColumnVisibility}
        text="Hide"
      />
      <MenuItem
        LeftIcon={IconFilter}
        onClick={handleColumnVisibility}
        text="Filter"
      />
      <MenuItem
        LeftIcon={IconSortDescending}
        onClick={handleSortClick}
        text="Sort"
      />
    </DropdownMenuItemsContainer>
  );
};
