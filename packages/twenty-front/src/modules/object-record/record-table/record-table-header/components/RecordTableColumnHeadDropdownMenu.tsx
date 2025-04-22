import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { onToggleColumnFilterComponentState } from '@/object-record/record-table/states/onToggleColumnFilterComponentState';
import { onToggleColumnSortComponentState } from '@/object-record/record-table/states/onToggleColumnSortComponentState';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useToggleScrollWrapper } from '@/ui/utilities/scroll/hooks/useToggleScrollWrapper';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useLingui } from '@lingui/react/macro';
import {
  IconArrowLeft,
  IconArrowRight,
  IconEyeOff,
  IconFilter,
  IconSortDescending,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { useTableColumns } from '../../hooks/useTableColumns';
import { ColumnDefinition } from '../../types/ColumnDefinition';

export type RecordTableColumnHeadDropdownMenuProps = {
  column: ColumnDefinition<FieldMetadata>;
};

export const RecordTableColumnHeadDropdownMenu = ({
  column,
}: RecordTableColumnHeadDropdownMenuProps) => {
  const { t } = useLingui();

  const { toggleScrollXWrapper, toggleScrollYWrapper } =
    useToggleScrollWrapper();

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

  const closeDropdownAndToggleScroll = () => {
    closeDropdown();
    toggleScrollXWrapper(true);
    toggleScrollYWrapper(false);
  };

  const handleColumnMoveLeft = () => {
    closeDropdownAndToggleScroll();
    if (!canMoveLeft) return;

    handleMoveTableColumn('left', column);
  };

  const handleColumnMoveRight = () => {
    closeDropdownAndToggleScroll();

    if (!canMoveRight) return;

    handleMoveTableColumn('right', column);
  };

  const handleColumnVisibility = () => {
    closeDropdownAndToggleScroll();
    handleColumnVisibilityChange(column);
  };

  const onToggleColumnFilter = useRecoilComponentValueV2(
    onToggleColumnFilterComponentState,
  );
  const onToggleColumnSort = useRecoilComponentValueV2(
    onToggleColumnSortComponentState,
  );

  const handleSortClick = () => {
    closeDropdownAndToggleScroll();

    onToggleColumnSort?.(column.fieldMetadataId);
  };

  const handleFilterClick = () => {
    closeDropdownAndToggleScroll();

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
          text={t`Filter`}
        />
      )}
      {isSortable && (
        <MenuItem
          LeftIcon={IconSortDescending}
          onClick={handleSortClick}
          text={t`Sort`}
        />
      )}
      {showSeparator && <DropdownMenuSeparator />}
      {canMoveLeft && (
        <MenuItem
          LeftIcon={IconArrowLeft}
          onClick={handleColumnMoveLeft}
          text={t`Move left`}
        />
      )}
      {canMoveRight && (
        <MenuItem
          LeftIcon={IconArrowRight}
          onClick={handleColumnMoveRight}
          text={t`Move right`}
        />
      )}
      {canHide && (
        <MenuItem
          LeftIcon={IconEyeOff}
          onClick={handleColumnVisibility}
          text={t`Hide`}
        />
      )}
    </DropdownMenuItemsContainer>
  );
};
