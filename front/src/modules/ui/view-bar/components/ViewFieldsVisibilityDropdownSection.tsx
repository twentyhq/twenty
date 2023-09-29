import {
  DropResult,
  OnDragEndResponder,
  ResponderProvided,
} from '@hello-pangea/dnd';

import { DraggableItem } from '@/ui/draggable-list/components/DraggableItem';
import { DroppableList } from '@/ui/draggable-list/components/DroppableList';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/dropdown/components/StyledDropdownMenuSubheader';
import { IconMinus, IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemDraggable } from '@/ui/menu-item/components/MenuItemDraggable';
import { ViewFieldForVisibility } from '../types/ViewFieldForVisibility';

type ViewFieldsVisibilityDropdownSectionProps = {
  fields: ViewFieldForVisibility[];
  onVisibilityChange: (field: ViewFieldForVisibility) => void;
  title: string;
  isDraggable: boolean;
  onDragEnd?: OnDragEndResponder;
};


export const ViewFieldsVisibilityDropdownSection = ({
  fields,
  onVisibilityChange,
  title,
  isDraggable,
  onDragEnd,
}: ViewFieldsVisibilityDropdownSectionProps) => {
  const handleOnDrag = (result: DropResult, provided: ResponderProvided) => {
    onDragEnd?.(result, provided);
  };

  const getIconButtons = (index: number, field: ViewFieldForVisibility) => {
    if (index !== 0) {
      return [
        {
          Icon: field.isVisible ? IconMinus : IconPlus,
          onClick: () => onVisibilityChange(field),
        },
      ];
    }
  };

  return (
    <>
      <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      <StyledDropdownMenuItemsContainer>
        {isDraggable && (
          <DroppableList
            droppableId="droppable"
            onDragEnd={handleOnDrag}
            draggableItems={
              <>
                {fields.map((field, index) => (
                  <DraggableItem
                    key={field.key}
                    draggableId={field.key}
                    index={index}
                    isDragDisabled={index === 0}
                    itemsComponent={
                      <MenuItemDraggable
                        key={field.key}
                        LeftIcon={field.Icon}
                        iconButtons={getIconButtons(index, field)}
                        text={field.name}
                        isDragDisabled={index === 0}
                      />
                    }
                  />
                ))}
              </>
            }
          />
        )}
        {!isDraggable &&
          fields.map((field) => (
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
};
