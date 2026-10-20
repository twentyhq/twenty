import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { DraggableListRowLeadingContent } from '@/ui/layout/draggable-list/components/DraggableListRowLeadingContent';

const DISABLED_PRIMARY_ACTION_OPACITY = 0.5;

const StyledListItem = styled(ListItem)`
  cursor: inherit;

  &[data-muted] {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledPrimaryAction = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
  max-width: 100%;
  outline: none;
  overflow: hidden;
  padding: 0;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::after {
    content: '';
    inset: 0;
    position: absolute;
  }

  &:focus-visible::after {
    border-radius: calc(
      ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
    );
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: ${DISABLED_PRIMARY_ACTION_OPACITY};
  }
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
        <StyledPrimaryAction
          type="button"
          onClick={onAction}
          disabled={isActionDisabled}
        >
          {children}
        </StyledPrimaryAction>
      ) : (
        children
      )}
    </StyledListItem>
  );
};
