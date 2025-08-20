import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useOpenRecordFilterChipFromTableHeader } from '@/object-record/record-table/record-table-header/hooks/useOpenRecordFilterChipFromTableHeader';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useToggleScrollWrapper } from '@/ui/utilities/scroll/hooks/useToggleScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
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
import { type ColumnDefinition } from '../../types/ColumnDefinition';

export type RecordTableColumnHeadDropdownMenuProps = {
  column: ColumnDefinition<FieldMetadata>;
  objectMetadataId: string;
};

const StyledDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

export const RecordTableColumnHeadDropdownMenu = ({
  column,
  objectMetadataId,
}: RecordTableColumnHeadDropdownMenuProps) => {
  const { t } = useLingui();

  const { toggleScrollXWrapper, toggleScrollYWrapper } =
    useToggleScrollWrapper();

  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
  );

  const secondVisibleColumn = visibleTableColumns[1];
  const canMove = column.isLabelIdentifier !== true;
  const canMoveLeft =
    column.fieldMetadataId !== secondVisibleColumn?.fieldMetadataId && canMove;

  const lastVisibleColumn = visibleTableColumns[visibleTableColumns.length - 1];
  const canMoveRight =
    column.fieldMetadataId !== lastVisibleColumn?.fieldMetadataId && canMove;

  const { recordTableId } = useRecordTableContextOrThrow();

  const { handleColumnVisibilityChange, handleMoveTableColumn } =
    useTableColumns({ recordTableId });

  const dropdownId = column.fieldMetadataId + '-header';

  const { closeDropdown } = useCloseDropdown();

  const closeDropdownAndToggleScroll = () => {
    closeDropdown(dropdownId);
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
    handleColumnVisibilityChange({
      ...column,
      isVisible: false,
    });
  };

  const handleToggleColumnSort = useHandleToggleColumnSort({
    objectMetadataItemId: objectMetadataId,
  });

  const handleSortClick = () => {
    closeDropdownAndToggleScroll();

    handleToggleColumnSort(column.fieldMetadataId);
  };

  const { openRecordFilterChipFromTableHeader } =
    useOpenRecordFilterChipFromTableHeader();

  const handleFilterClick = () => {
    closeDropdownAndToggleScroll();

    openRecordFilterChipFromTableHeader(column.fieldMetadataId);
  };

  const isSortable = column.isSortable === true;
  const isFilterable = column.isFilterable === true;
  const showSeparator =
    (isFilterable || isSortable) && column.isLabelIdentifier !== true;
  const canHide = column.isLabelIdentifier !== true;

  return (
    <DropdownContent>
      <StyledDropdownMenuItemsContainer>
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
      </StyledDropdownMenuItemsContainer>
    </DropdownContent>
  );
};
