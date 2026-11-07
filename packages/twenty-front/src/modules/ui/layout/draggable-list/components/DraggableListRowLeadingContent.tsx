import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconGripVertical } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledDefaultIcon = styled.span`
  display: flex;

  [data-draggable-list-row]:hover &,
  [data-draggable-list-row]:focus-within & {
    opacity: 0;
  }
`;

const StyledIcon = styled.span`
  align-items: center;
  display: inline-flex;
  justify-content: center;
  position: relative;

  > svg,
  ${StyledDefaultIcon} > svg {
    flex-shrink: 0;
    height: calc(${themeCssVariables.icon.size.md} * 1px);
    stroke-width: ${themeCssVariables.icon.stroke.sm};
    width: calc(${themeCssVariables.icon.size.md} * 1px);
  }

  > svg[data-hover-grip] {
    opacity: 0;
    position: absolute;
  }

  [data-draggable-list-row]:hover & > svg[data-hover-grip],
  [data-draggable-list-row]:focus-within & > svg[data-hover-grip] {
    opacity: 1;
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

type DraggableListRowLeadingContentProps = {
  startIcon?: ReactNode;
  dragHandleVisibility: 'always' | 'hover' | 'none';
  hasIconBackground: boolean;
  isDragDisabled: boolean;
};

const getGripColor = ({
  hasIconBackground,
  isDragDisabled,
}: Pick<
  DraggableListRowLeadingContentProps,
  'hasIconBackground' | 'isDragDisabled'
>) => {
  if (hasIconBackground) {
    return themeCssVariables.font.color.tertiary;
  }

  if (isDragDisabled) {
    return themeCssVariables.font.color.extraLight;
  }

  return themeCssVariables.font.color.light;
};

const renderStartIcon = ({
  startIcon,
  grip,
  dragHandleVisibility,
  hasIconBackground,
}: Pick<
  DraggableListRowLeadingContentProps,
  'startIcon' | 'dragHandleVisibility' | 'hasIconBackground'
> & {
  grip: ReactNode;
}) => {
  if (!isDefined(startIcon)) {
    return null;
  }

  if (dragHandleVisibility === 'hover') {
    return (
      <StyledIcon data-background={hasIconBackground || undefined}>
        <StyledDefaultIcon>{startIcon}</StyledDefaultIcon>
        {grip}
      </StyledIcon>
    );
  }

  return (
    <StyledIcon data-background={hasIconBackground || undefined}>
      {startIcon}
    </StyledIcon>
  );
};

export const DraggableListRowLeadingContent = ({
  startIcon,
  dragHandleVisibility,
  hasIconBackground,
  isDragDisabled,
}: DraggableListRowLeadingContentProps) => {
  const theme = useTheme();
  const gripColor = getGripColor({ hasIconBackground, isDragDisabled });
  const grip = (
    <IconGripVertical
      size={theme.icon.size.md}
      stroke={theme.icon.stroke.sm}
      color={gripColor}
      data-hover-grip={dragHandleVisibility === 'hover' || undefined}
      aria-hidden
    />
  );

  return (
    <StyledLeadingContent>
      {dragHandleVisibility === 'always' && (
        <StyledIcon data-background={hasIconBackground || undefined}>
          {grip}
        </StyledIcon>
      )}
      {renderStartIcon({
        startIcon,
        grip,
        dragHandleVisibility,
        hasIconBackground,
      })}
    </StyledLeadingContent>
  );
};
