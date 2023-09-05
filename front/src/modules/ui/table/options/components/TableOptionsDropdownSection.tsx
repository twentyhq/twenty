import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/dropdown/components/StyledDropdownMenuSubheader';
import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { IconMinus, IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

import { useTableColumns } from '../../hooks/useTableColumns';
import type { ColumnDefinition } from '../../types/ColumnDefinition';

type OwnProps = {
  title: string;
  columns: ColumnDefinition<ViewFieldMetadata>[];
};

export function TableOptionsDropdownColumnVisibility({
  title,
  columns,
}: OwnProps) {
  const { handleColumnVisibilityChange } = useTableColumns();

  return (
    <>
      <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      <StyledDropdownMenuItemsContainer>
        {columns.map((column) => (
          <MenuItem
            key={column.key}
            LeftIcon={column.Icon}
            iconButtons={[
              {
                Icon: column.isVisible ? IconMinus : IconPlus,
                onClick: () => handleColumnVisibilityChange(column),
              },
            ]}
            text={column.name}
          />
        ))}
      </StyledDropdownMenuItemsContainer>
    </>
  );
}
