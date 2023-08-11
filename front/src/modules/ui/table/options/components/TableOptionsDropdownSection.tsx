import { cloneElement } from 'react';
import { useTheme } from '@emotion/react';

import {
  DropdownMenuItem,
  DropdownMenuItemProps,
} from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSubheader } from '@/ui/dropdown/components/DropdownMenuSubheader';
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

export const TableOptionsDropdownSection = ({
  renderActions,
  title,
  columns,
}: TableOptionsDropdownSectionProps) => {
  const theme = useTheme();

  return (
    <>
      <DropdownMenuSubheader>{title}</DropdownMenuSubheader>
      <DropdownMenuItemsContainer>
        {columns.map((column) => (
          <DropdownMenuItem key={column.id} actions={renderActions(column)}>
            {column.columnIcon &&
              cloneElement(column.columnIcon, {
                size: theme.icon.size.md,
              })}
            {column.columnLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
