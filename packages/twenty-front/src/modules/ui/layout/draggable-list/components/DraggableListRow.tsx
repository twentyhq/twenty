import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconGripVertical } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledDefaultIcon = styled.span`
  display: flex;
`;

const StyledGripIcon = styled.span`
  align-items: center;
  display: flex;
`;

const StyledHoverGripIcon = styled(StyledGripIcon)`
  opacity: 0;
  position: absolute;
`;

const StyledIcon = styled.span`
  align-items: center;
  display: inline-flex;
  justify-content: center;
  position: relative;

  > svg,
  ${StyledDefaultIcon} > svg,
  ${StyledGripIcon} > svg {
    flex-shrink: 0;
    height: calc(${themeCssVariables.icon.size.md} * 1px);
    stroke-width: ${themeCssVariables.icon.stroke.sm};
    width: calc(${themeCssVariables.icon.size.md} * 1px);
  }

  &[data-background] {
    background: ${themeCssVariables.background.transparent.light};
    border-radius: ${themeCssVariables.border.radius.sm};
    padding: ${themeCssVariables.spacing[1]};
  }
`;

const StyledLeadingContent = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
  position: relative;
  z-index: 1;
`;

const StyledListItem = styled(ListItem)`
  cursor: inherit;

  &[data-muted] {
    color: ${themeCssVariables.font.color.tertiary};
  }

  &:hover ${StyledDefaultIcon}, &:focus-within ${StyledDefaultIcon} {
    opacity: 0;
  }

  &:hover ${StyledHoverGripIcon}, &:focus-within ${StyledHoverGripIcon} {
    opacity: 1;
  }
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledPrimaryAction = styled(Button)`
  border: 0;
  color: inherit;
  font: inherit;
  min-height: 0;
  padding: 0;
  position: static;

  &:hover {
    background: transparent;
  }

  &::after {
    content: '';
    inset: 0;
    position: absolute;
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
  withIconBackground?: boolean;
  muted?: boolean;
  onAction?: () => void;
  actionDisabled?: boolean;
};

export const DraggableListRow = ({
  children,
  startIcon,
  actions,
  actionsVisibility = 'hover',
  description,
  dragHandleVisibility = 'none',
  isDragDisabled = false,
  withIconBackground = false,
  muted = false,
  onAction,
  actionDisabled = false,
}: DraggableListRowProps) => {
  const theme = useTheme();
  const gripColor = withIconBackground
    ? themeCssVariables.font.color.tertiary
    : isDragDisabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.light;

  const grip = (
    <IconGripVertical
      size={theme.icon.size.md}
      stroke={theme.icon.stroke.sm}
      color={gripColor}
      aria-hidden
    />
  );

  const hasLeadingContent =
    isDefined(startIcon) || dragHandleVisibility === 'always';

  return (
    <StyledListItem
      data-muted={muted || undefined}
      startIcon={
        hasLeadingContent ? (
          <StyledLeadingContent>
            {dragHandleVisibility === 'always' && (
              <StyledIcon data-background={withIconBackground || undefined}>
                <StyledGripIcon>{grip}</StyledGripIcon>
              </StyledIcon>
            )}
            {isDefined(startIcon) && (
              <StyledIcon data-background={withIconBackground || undefined}>
                {dragHandleVisibility === 'hover' ? (
                  <>
                    <StyledDefaultIcon>{startIcon}</StyledDefaultIcon>
                    <StyledHoverGripIcon>{grip}</StyledHoverGripIcon>
                  </>
                ) : (
                  startIcon
                )}
              </StyledIcon>
            )}
          </StyledLeadingContent>
        ) : undefined
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
          variant="ghost"
          onClick={onAction}
          disabled={actionDisabled}
        >
          {children}
        </StyledPrimaryAction>
      ) : (
        children
      )}
    </StyledListItem>
  );
};
