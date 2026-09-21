import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledScrollOverlayButton = styled.button<{
  hasTitle: boolean;
  isVisible: boolean;
}>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  bottom: ${themeCssVariables.spacing[3]};
  box-shadow: ${themeCssVariables.boxShadow.light};
  color: ${themeCssVariables.font.color.secondary};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  height: 32px;
  justify-content: center;
  left: 50%;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  padding: ${({ hasTitle }) =>
    hasTitle ? `0 ${themeCssVariables.spacing[3]}` : '0'};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  position: absolute;
  transform: translateX(-50%);
  transition:
    opacity calc(${themeCssVariables.animation.duration.normal} * 1s) ease,
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
  width: ${({ hasTitle }) => (hasTitle ? 'auto' : '32px')};
  z-index: 1;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;

type ScrollOverlayButtonProps = {
  ariaLabel: string;
  isVisible: boolean;
  onClick: () => void;
  Icon?: IconComponent;
  title?: string;
};

export const ScrollOverlayButton = ({
  ariaLabel,
  isVisible,
  onClick,
  Icon,
  title,
}: ScrollOverlayButtonProps) => {
  const theme = useTheme();

  return (
    <StyledScrollOverlayButton
      aria-hidden={!isVisible}
      aria-label={ariaLabel}
      hasTitle={isDefined(title)}
      isVisible={isVisible}
      tabIndex={isVisible ? 0 : -1}
      type="button"
      onClick={onClick}
    >
      {isDefined(Icon) && <Icon size={theme.icon.size.md} />}
      {title}
    </StyledScrollOverlayButton>
  );
};
