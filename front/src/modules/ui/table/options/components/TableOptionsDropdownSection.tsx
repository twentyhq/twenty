import { cloneElement } from 'react';
import { useTheme } from '@emotion/react';

import {
  DropdownMenuItem,
  DropdownMenuItemProps,
} from '@/ui/dropdown/components/DropdownMenuItem';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/dropdown/components/StyledDropdownMenuSubheader';
import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import type { ColumnDefinition } from '../../types/ColumnDefinition';

type TableOptionsDropdownSectionProps = {
  renderActions: (
    column: ColumnDefinition<ViewFieldMetadata>,
  ) => DropdownMenuItemProps['actions'];
  title: string;
  columns: ColumnDefinition<ViewFieldMetadata>[];
};

export function TableOptionsDropdownSection({
  renderActions,
  title,
  columns,
}: TableOptionsDropdownSectionProps) {
  const theme = useTheme();

  return (
    <>
      <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      <StyledDropdownMenuItemsContainer>
        {columns.map((column) => (
          <DropdownMenuItem key={column.key} actions={renderActions(column)}>
            {column.icon &&
              cloneElement(column.icon, {
                size: theme.icon.size.md,
              })}
            {column.name}
          </DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
    </>
  );
}
