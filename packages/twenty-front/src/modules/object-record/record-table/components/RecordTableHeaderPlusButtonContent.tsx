import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { IconSettings } from '@/ui/display/icon';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { FieldMetadata } from '../../field/types/FieldMetadata';
import { useRecordTableScopedStates } from '../hooks/internal/useRecordTableScopedStates';
import { useTableColumns } from '../hooks/useTableColumns';
import { ColumnDefinition } from '../types/ColumnDefinition';

export const RecordTableHeaderPlusButtonContent = () => {
  const { closeDropdown } = useDropdown();

  const { hiddenTableColumnsScopeInjector } = getRecordTableScopeInjector();

  const { injectSelectorWithRecordTableScopeId } = useRecordTableScopedStates();

  const hiddenTableColumnsSelector = injectSelectorWithRecordTableScopeId(
    hiddenTableColumnsScopeInjector,
  );

  const hiddenTableColumns = useRecoilValue(hiddenTableColumnsSelector);

  const { getIcon } = useIcons();
  const { handleColumnVisibilityChange } = useTableColumns();

  const handleAddColumn = useCallback(
    (column: ColumnDefinition<FieldMetadata>) => {
      closeDropdown();
      handleColumnVisibilityChange(column);
    },
    [handleColumnVisibilityChange, closeDropdown],
  );

  const StyledMenuItemLink = styled(Link)`
    text-decoration: none;
    width: 100%;
  `;

  return (
    <>
      <DropdownMenuItemsContainer>
        {hiddenTableColumns.map((column) => (
          <MenuItem
            key={column.fieldMetadataId}
            onClick={() => handleAddColumn(column)}
            LeftIcon={getIcon(column.iconName)}
            text={column.label}
          />
        ))}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <StyledMenuItemLink to="/settings/objects">
          <MenuItem LeftIcon={IconSettings} text="Customize fields" />
        </StyledMenuItemLink>
      </DropdownMenuItemsContainer>
    </>
  );
};
