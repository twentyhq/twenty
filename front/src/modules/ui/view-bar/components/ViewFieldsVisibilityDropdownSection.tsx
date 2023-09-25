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
import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { IconMinus, IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

type OwnProps<Field> = {
  fields: Field[];
  onVisibilityChange: (field: Field) => void;
  title: string;
  isDraggable: boolean;
  onDragEnd?: OnDragEndResponder;
};

const StyledDropdownMenuItemWrapper = styled.div`
  width: 100%;
`;

export const ViewFieldsVisibilityDropdownSection = <
  Field extends ViewFieldDefinition<ViewFieldMetadata>,
>({
  fields,
  onVisibilityChange,
  title,
  isDraggable,
  onDragEnd,
}: OwnProps<Field>) => {
  const handleOnDrag = (result: DropResult, provided: ResponderProvided) => {
    onDragEnd?.(result, provided);
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
                              <MenuItem
                                isDraggable={isDraggable}
                                key={field.key}
                                LeftIcon={field.Icon}
                                iconButtons={[
                                  {
                                    Icon: field.isVisible
                                      ? IconMinus
                                      : IconPlus,
                                    onClick: () => onVisibilityChange(field),
                                  },
                                ]}
                                text={field.name}
                              />
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
