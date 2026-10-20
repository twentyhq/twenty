import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { DraggableListRowLeadingContent } from '@/ui/layout/draggable-list/components/DraggableListRowLeadingContent';
import { DraggableListRowPrimaryAction } from '@/ui/layout/draggable-list/components/DraggableListRowPrimaryAction';

const StyledListItem = styled(ListItem)`
  cursor: inherit;

  &[data-muted] {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledActions = styled.span`
  align-items: center;
  display: flex;
  position: relative;
  z-index: 1;
`;

type DraggableListRowProps = {
  children: ReactNode;
  startIcon?: ReactNode;
  actions?: ReactNode;
  actionsVisibility?: 'hover' | 'always';
  description?: ReactNode;
  dragHandleVisibility?: 'always' | 'hover' | 'none';
  isDragDisabled?: boolean;
  hasIconBackground?: boolean;
  isMuted?: boolean;
  onAction?: () => void;
  isActionDisabled?: boolean;
};

export const DraggableListRow = ({
  children,
  startIcon,
  actions,
  actionsVisibility = 'hover',
  description,
  dragHandleVisibility = 'none',
  isDragDisabled = false,
  hasIconBackground = false,
  isMuted = false,
  onAction,
  isActionDisabled = false,
}: DraggableListRowProps) => {
  const hasLeadingContent =
    isDefined(startIcon) || dragHandleVisibility === 'always';

  return (
    <StyledListItem
      data-draggable-list-row
      data-muted={isMuted || undefined}
      startIcon={
        hasLeadingContent && (
          <DraggableListRowLeadingContent
            startIcon={startIcon}
            dragHandleVisibility={dragHandleVisibility}
            hasIconBackground={hasIconBackground}
            isDragDisabled={isDragDisabled}
          />
        )
      }
      description={
        isDefined(description) ? (
          <StyledDescription>{description}</StyledDescription>
        ) : undefined
      }
      actions={
        isDefined(actions) ? (
          <StyledActions>{actions}</StyledActions>
        ) : undefined
      }
      actionsVisibility={actionsVisibility}
    >
      {isDefined(onAction) ? (
        <DraggableListRowPrimaryAction
          onAction={onAction}
          isDisabled={isActionDisabled}
        >
          {children}
        </DraggableListRowPrimaryAction>
      ) : (
        children
      )}
    </StyledListItem>
  );
};
