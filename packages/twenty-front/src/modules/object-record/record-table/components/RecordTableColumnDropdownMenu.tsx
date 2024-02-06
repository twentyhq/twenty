import { useRecoilValue } from 'recoil';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { IconArrowLeft, IconArrowRight, IconEyeOff } from '@/ui/display/icon';
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
  const {
    getLabelIdentifierTableColumnSelector,
    getVisibleTableColumnsSelector,
  } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(getVisibleTableColumnsSelector());
  const labelIdentifierColumn = useRecoilValue(
    getLabelIdentifierTableColumnSelector(),
  );

  const isLabelIdentifierColumn =
    labelIdentifierColumn?.fieldMetadataId === column.fieldMetadataId;
  const secondVisibleColumn = visibleTableColumns[1];
  const isSecondVisibleColumn =
    column.fieldMetadataId === secondVisibleColumn?.fieldMetadataId;
  const lastVisibleColumn = visibleTableColumns[visibleTableColumns.length - 1];
  const isLastVisibleColumn =
    column.fieldMetadataId === lastVisibleColumn?.fieldMetadataId;

  const canHide = !isLabelIdentifierColumn;
  const canMoveLeft = !isLabelIdentifierColumn && !isSecondVisibleColumn;
  const canMoveRight = !isLabelIdentifierColumn && !isLastVisibleColumn;

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

  if (!canHide && !canMoveLeft && !canMoveRight) return null;

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
