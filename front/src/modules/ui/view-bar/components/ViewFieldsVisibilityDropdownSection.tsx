import { useState } from 'react';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  OnDragEndResponder,
  ResponderProvided,
} from '@hello-pangea/dnd';

import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/dropdown/components/StyledDropdownMenuSubheader';
import { IconMinus, IconPencil, IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemTag } from '@/ui/menu-item/components/MenuItemTag';

import { ViewFieldForVisibility } from '../types/ViewFieldForVisibility';

type ViewFieldsVisibilityDropdownSectionProps = {
  fields: ViewFieldForVisibility[];
  onVisibilityChange: (field: ViewFieldForVisibility) => void;
  editFieldComponent?: (field: ViewFieldForVisibility) => JSX.Element;
  title: string;
  isDraggable: boolean;
  fieldAsTag?: boolean;
  onDragEnd?: OnDragEndResponder;
};

const StyledDropdownMenuItemWrapper = styled.div`
  width: 100%;
`;

export const ViewFieldsVisibilityDropdownSection = ({
  fields,
  onVisibilityChange,
  editFieldComponent,
  title,
  isDraggable,
  fieldAsTag = false,
  onDragEnd,
}: ViewFieldsVisibilityDropdownSectionProps) => {
  const [selectedField, setSelectedField] = useState<ViewFieldForVisibility>();
  const handleOnDrag = (result: DropResult, provided: ResponderProvided) => {
    onDragEnd?.(result, provided);
  };

  const getIconButtons = (index: number, field: ViewFieldForVisibility) => {
    const visibilityIcons = {
      Icon: field.isVisible ? IconMinus : IconPlus,
      onClick: () => onVisibilityChange(field),
    };
    if (index !== 0) {
      return editFieldComponent
        ? [
            visibilityIcons,
            {
              Icon: IconPencil,
              onClick: () => setSelectedField(field),
            },
          ]
        : [visibilityIcons];
    }
  };

  return (
    <>
      <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      <StyledDropdownMenuItemsContainer>
        {isDraggable && (
          <DragDropContext onDragEnd={handleOnDrag}>
            <StyledDropdownMenuItemWrapper>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {fields.map((field, index) => (
                      <Draggable
                        key={field.key}
                        draggableId={field.key}
                        index={index}
                        isDragDisabled={index === 0}
                      >
                        {(draggableProvided) => {
                          const draggableStyle =
                            draggableProvided.draggableProps.style;

                          return (
                            <div
                              ref={draggableProvided.innerRef}
                              {...{
                                ...draggableProvided.draggableProps,
                                style: {
                                  ...draggableStyle,
                                  left: 'auto',
                                  top: 'auto',
                                  transform: draggableStyle?.transform?.replace(
                                    /\(-?\d+px,/,
                                    '(0,',
                                  ),
                                },
                              }}
                              {...draggableProvided.dragHandleProps}
                            >
                              {fieldAsTag ? (
                                <MenuItemTag
                                  isDraggable={index !== 0 && isDraggable}
                                  key={field.key}
                                  color={field.colorCode ?? 'gray'}
                                  iconButtons={getIconButtons(index, field)}
                                  text={field.name}
                                />
                              ) : (
                                <MenuItem
                                  isDraggable={index !== 0 && isDraggable}
                                  key={field.key}
                                  LeftIcon={field.Icon}
                                  iconButtons={getIconButtons(index, field)}
                                  text={field.name}
                                />
                              )}
                              {selectedField === field &&
                                editFieldComponent &&
                                editFieldComponent(field)}
                            </div>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </StyledDropdownMenuItemWrapper>
          </DragDropContext>
        )}
        {!isDraggable &&
          fields.map((field) =>
            fieldAsTag ? (
              <MenuItemTag
                key={field.key}
                color={field.colorCode ?? 'gray'}
                iconButtons={[
                  {
                    Icon: field.isVisible ? IconMinus : IconPlus,
                    onClick: () => onVisibilityChange(field),
                  },
                ]}
                text={field.name}
              />
            ) : (
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
            ),
          )}
      </StyledDropdownMenuItemsContainer>
    </>
  );
};
