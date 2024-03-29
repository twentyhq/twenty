import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { getOperandsForFilterType } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { useObjectSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useObjectSortDropdown';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import {
  IconArrowLeft,
  IconArrowRight,
  IconEyeOff,
  IconFilter,
  IconSortDescending,
} from '@/ui/display/icon';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { isDefined } from '~/utils/isDefined';

import { useTableColumns } from '../hooks/useTableColumns';
import { ColumnDefinition } from '../types/ColumnDefinition';

export type RecordTableColumnDropdownMenuProps = {
  column: ColumnDefinition<FieldMetadata>;
};

export const RecordTableColumnDropdownMenu = ({
  column,
}: RecordTableColumnDropdownMenuProps) => {
  const { visibleTableColumnsSelector } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

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

  const { availableSortDefinitions, handleAddSort: addSortHandler } =
    useObjectSortDropdown();

  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
    availableFilterDefinitionsState,
    selectFilter,
    setIsObjectFilterDropdownOperandSelectUnfolded,
  } = useFilterDropdown({ filterDropdownId: 'view-filter' });

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );

  const handleSortClick = () => {
    closeDropdown();
    const sortDefinition = availableSortDefinitions.find(
      (definition) => definition.fieldMetadataId === column.fieldMetadataId,
    );
    if (isDefined(sortDefinition)) {
      addSortHandler(sortDefinition);
    }
  };

  const setHotkeyScope = useSetHotkeyScope();

  const handleFilterClick = () => {
    closeDropdown();

    const filterDefinition = availableFilterDefinitions.find(
      (definition) => definition.fieldMetadataId === column.fieldMetadataId,
    );

    if (isDefined(filterDefinition)) {
      selectFilter?.({
        fieldMetadataId: column.fieldMetadataId,
        value: '',
        operand: getOperandsForFilterType(filterDefinition.type)?.[0],
        displayValue: '',
        definition: filterDefinition,
      });
      setIsObjectFilterDropdownOperandSelectUnfolded(false);
      setFilterDefinitionUsedInDropdown(filterDefinition);
      if (filterDefinition.type === 'RELATION') {
        setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
      }
      setSelectedOperandInDropdown(
        getOperandsForFilterType(filterDefinition.type)?.[0],
      );
      setObjectFilterDropdownSearchInput('');
    }
  };

  return (
    <DropdownMenuItemsContainer>
      <MenuItem
        LeftIcon={IconFilter}
        onClick={handleFilterClick}
        text="Filter"
      />
      <MenuItem
        LeftIcon={IconSortDescending}
        onClick={handleSortClick}
        text="Sort"
      />
      <DropdownMenuSeparator />
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
    </DropdownMenuItemsContainer>
  );
};
