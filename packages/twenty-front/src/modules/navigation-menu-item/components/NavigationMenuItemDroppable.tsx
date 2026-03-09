import { Droppable } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useIsDropDisabledForSection } from '@/navigation-menu-item/hooks/useIsDropDisabledForSection';

type NavigationMenuItemDroppableProps = {
  droppableId: string;
  children: React.ReactNode;
  isDragIndicatorVisible?: boolean;
  showDropLine?: boolean;
  isWorkspaceSection?: boolean;
};

const StyledDroppableWrapper = styled.div`
  position: relative;
  transition: all 150ms ease-in-out;
  width: 100%;

  &[data-dragging-over='true'] {
    background-color: ${themeCssVariables.background.transparent.blue};
  }

  &[data-dragging-over='true'][data-show-drop-line='true']::before {
    background-color: ${themeCssVariables.color.blue};
    border-radius: ${themeCssVariables.border.radius.sm}
      ${themeCssVariables.border.radius.sm} 0 0;
    bottom: 0;
    content: '';
    height: 2px;
    left: 0;
    position: absolute;
    width: 100%;
  }
`;

export const NavigationMenuItemDroppable = ({
  droppableId,
  children,
  isDragIndicatorVisible = true,
  showDropLine = true,
  isWorkspaceSection = false,
}: NavigationMenuItemDroppableProps) => {
  const isDropDisabled = useIsDropDisabledForSection(isWorkspaceSection);

  return (
    <Droppable droppableId={droppableId} isDropDisabled={isDropDisabled}>
      {(provided, snapshot) => (
        <StyledDroppableWrapper
          data-dragging-over={
            snapshot.isDraggingOver && isDragIndicatorVisible
              ? 'true'
              : undefined
          }
          data-show-drop-line={showDropLine ? 'true' : undefined}
        >
          <div
            ref={provided.innerRef}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {children}
            {provided.placeholder}
          </div>
        </StyledDroppableWrapper>
      )}
    </Droppable>
  );
};
