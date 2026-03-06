import { styled } from '@linaria/react';
import { Droppable } from '@hello-pangea/dnd';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useIsDropDisabledForSection } from '@/navigation-menu-item/hooks/useIsDropDisabledForSection';

type NavigationMenuItemDroppableProps = {
  droppableId: string;
  children: React.ReactNode;
  isDragIndicatorVisible?: boolean;
  showDropLine?: boolean;
  isWorkspaceSection?: boolean;
};

const StyledDroppableWrapper = styled.div<{
  isDraggingOver: boolean;
  isDragIndicatorVisible: boolean;
  showDropLine: boolean;
}>`
  position: relative;
  transition: all 150ms ease-in-out;
  width: 100%;

  ${({ isDraggingOver, isDragIndicatorVisible, showDropLine }) =>
    isDraggingOver && isDragIndicatorVisible
      ? `
        background-color: ${themeCssVariables.background.transparent.blue};

        ${
          showDropLine
            ? `
          &::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: ${themeCssVariables.color.blue};
            border-radius: ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0 0;
          }
        `
            : ''
        }
      `
      : ''}
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
          isDraggingOver={snapshot.isDraggingOver}
          isDragIndicatorVisible={isDragIndicatorVisible}
          showDropLine={showDropLine}
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
