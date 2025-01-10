import {
  IconArrowLeft,
  IconArrowRight,
  IconEyeOff,
  IconFilter,
  IconSortDescending,
  MenuItem,
} from 'twenty-ui';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { onToggleColumnFilterComponentState } from '@/object-record/record-table/states/onToggleColumnFilterComponentState';
import { onToggleColumnSortComponentState } from '@/object-record/record-table/states/onToggleColumnSortComponentState';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTranslation } from 'react-i18next';
import { useTableColumns } from '../../hooks/useTableColumns';
import { ColumnDefinition } from '../../types/ColumnDefinition';

export type RecordTableColumnHeadDropdownMenuProps = {
  column: ColumnDefinition<FieldMetadata>;
};

export const RecordTableColumnHeadDropdownMenu = ({
  column,
}: RecordTableColumnHeadDropdownMenuProps) => {
  const { t } = useTranslation();
  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

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

  const onToggleColumnFilter = useRecoilComponentValueV2(
    onToggleColumnFilterComponentState,
  );
  const onToggleColumnSort = useRecoilComponentValueV2(
    onToggleColumnSortComponentState,
  );

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
          text={t('filter')}
        />
      )}
      {isSortable && (
        <MenuItem
          LeftIcon={IconSortDescending}
          onClick={handleSortClick}
          text={t('sort')}
        />
      )}
      {showSeparator && <DropdownMenuSeparator />}
      {canMoveLeft && (
        <MenuItem
          LeftIcon={IconArrowLeft}
          onClick={handleColumnMoveLeft}
          text={t('moveLeft')}
        />
      )}
      {canMoveRight && (
        <MenuItem
          LeftIcon={IconArrowRight}
          onClick={handleColumnMoveRight}
          text={t('moveRight')}
        />
      )}
      {canHide && (
        <MenuItem
          LeftIcon={IconEyeOff}
          onClick={handleColumnVisibility}
          text={t('hide')}
        />
      )}
    </DropdownMenuItemsContainer>
  );
};
