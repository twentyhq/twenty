import { useCallback } from 'react';

import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { IconPlus } from '@/ui/display/icon';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useTableColumns } from '../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import { ColumnDefinition } from '../types/ColumnDefinition';

export const DataTableHeaderPlusButtonContent = () => {
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
          key={column.key}
          iconButtons={[
            {
              Icon: IconPlus,
              onClick: () => handleAddColumn(column),
            },
          ]}
          LeftIcon={column.Icon}
          text={column.name}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
