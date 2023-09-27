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
import { IconMinus, IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

import { ViewFieldForVisibility } from '../types/ViewFieldForVisibility';

type OwnProps = {
  fields: ViewFieldForVisibility[];
  onVisibilityChange: (field: ViewFieldForVisibility) => void;
  title: string;
  isDraggable: boolean;
  onDragEnd?: OnDragEndResponder;
};

const StyledDropdownMenuItemWrapper = styled.div`
  width: 100%;
`;

export const ViewFieldsVisibilityDropdownSection = ({
  fields,
  onVisibilityChange,
  title,
  isDraggable,
  onDragEnd,
}: OwnProps) => {
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
                              <MenuItem
                                isDraggable={index !== 0 && isDraggable}
                                key={field.key}
                                LeftIcon={field.Icon}
                                iconButtons={getIconButtons(index, field)}
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
