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
} from '@/ui/table/types/ViewField';

type OptionsDropdownSectionProps = {
  renderActions: (
    viewField: ViewFieldDefinition<ViewFieldMetadata>,
  ) => DropdownMenuItemProps['actions'];
  title: string;
  viewFields: ViewFieldDefinition<ViewFieldMetadata>[];
};

export const OptionsDropdownSection = ({
  renderActions,
  title,
  viewFields,
}: OptionsDropdownSectionProps) => {
  const theme = useTheme();

  return (
    <>
      <DropdownMenuSubheader>{title}</DropdownMenuSubheader>
      <DropdownMenuItemsContainer>
        {viewFields.map((viewField) => (
          <DropdownMenuItem actions={renderActions(viewField)}>
            {viewField.columnIcon &&
              cloneElement(viewField.columnIcon, {
                size: theme.icon.size.md,
              })}
            {viewField.columnLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
