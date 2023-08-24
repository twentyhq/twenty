import { cloneElement } from 'react';
import { useTheme } from '@emotion/react';

import {
  DropdownMenuItem,
  DropdownMenuItemProps,
} from '@/ui/dropdown/components/DropdownMenuItem';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/dropdown/components/StyledDropdownMenuSubheader';
import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

type TableOptionsDropdownSectionProps = {
  renderActions: (
    column: ViewFieldDefinition<ViewFieldMetadata>,
  ) => DropdownMenuItemProps['actions'];
  title: string;
  columns: ViewFieldDefinition<ViewFieldMetadata>[];
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
          <DropdownMenuItem key={column.id} actions={renderActions(column)}>
            {column.columnIcon &&
              cloneElement(column.columnIcon, {
                size: theme.icon.size.md,
              })}
            {column.columnLabel}
          </DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
    </>
  );
}
