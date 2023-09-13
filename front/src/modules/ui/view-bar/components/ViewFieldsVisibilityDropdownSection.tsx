import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/dropdown/components/StyledDropdownMenuSubheader';
import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { IconMinus, IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

type OwnProps<Field> = {
  fields: Field[];
  onVisibilityChange: (field: Field) => void;
  title: string;
};

export function ViewFieldsVisibilityDropdownSection<
  Field extends ViewFieldDefinition<ViewFieldMetadata>,
>({ fields, onVisibilityChange, title }: OwnProps<Field>) {
  return (
    <>
      <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      <StyledDropdownMenuItemsContainer>
        {fields.map((field) => (
          <MenuItem
            key={field.key}
            LeftIcon={field.Icon}
            iconButtons={[
              {
                Icon: field.isVisible ? IconMinus : IconPlus,
                onClick: () => onVisibilityChange(field),
              },
            ]}
            text={field.name}
          />
        ))}
      </StyledDropdownMenuItemsContainer>
    </>
  );
}
