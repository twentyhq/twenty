import { useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconSettings, useIcons } from 'twenty-ui';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useTableColumns } from '@/object-record/record-table/hooks/useTableColumns';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

export const RecordTableHeaderPlusButtonContent = () => {
  const { objectMetadataItem } = useContext(RecordTableContext);
  const { closeDropdown } = useDropdown();

  const { hiddenTableColumnsSelector } = useRecordTableStates();

  const hiddenTableColumns = useRecoilValue(hiddenTableColumnsSelector());

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
      {hiddenTableColumns.length > 0 && (
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
        </>
      )}
      <DropdownMenuItemsContainer>
        <StyledMenuItemLink
          to={`/settings/objects/${objectMetadataItem.namePlural}`}
        >
          <MenuItem LeftIcon={IconSettings} text="Customize fields" />
        </StyledMenuItemLink>
      </DropdownMenuItemsContainer>
    </>
  );
};
