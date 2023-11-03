import { useCallback } from 'react';

import { IconPlus } from '@/ui/display/icon';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { FieldMetadata } from '../../field/types/FieldMetadata';
import { useTableColumns } from '../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import { ColumnDefinition } from '../types/ColumnDefinition';

export const RecordTableHeaderPlusButtonContent = () => {
  const { closeDropdown } = useDropdown();

  const hiddenTableColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );

  const { handleColumnVisibilityChange } = useTableColumns();

  const handleAddColumn = useCallback(
    (column: ColumnDefinition<FieldMetadata>) => {
      closeDropdown();
      handleColumnVisibilityChange(column);
    },
    [handleColumnVisibilityChange, closeDropdown],
  );

  return (
    <DropdownMenuItemsContainer>
      {hiddenTableColumns.map((column) => (
        <MenuItem
          key={column.fieldId}
          iconButtons={[
            {
              Icon: IconPlus,
              onClick: () => handleAddColumn(column),
            },
          ]}
          LeftIcon={column.Icon}
          text={column.label}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
