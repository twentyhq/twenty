import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledScrollOverlayContainer = styled.div<{ isVisible: boolean }>`
  bottom: ${themeCssVariables.spacing[3]};
  left: 50%;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  position: absolute;
  transform: translateX(-50%);
  transition: opacity calc(${themeCssVariables.animation.duration.normal} * 1s)
    ease;
  z-index: 1;
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
  if (isDefined(title)) {
    return (
      <StyledScrollOverlayContainer isVisible={isVisible}>
        <Button
          aria-hidden={!isVisible}
          aria-label={ariaLabel}
          variant="outline"
          elevated
          size="md"
          startIcon={isDefined(Icon) ? <Icon /> : undefined}
          tabIndex={isVisible ? 0 : -1}
          onClick={onClick}
        >
          {title}
        </Button>
      </StyledScrollOverlayContainer>
    );
  }

  return (
    <StyledScrollOverlayContainer isVisible={isVisible}>
      <IconButton
        aria-hidden={!isVisible}
        aria-label={ariaLabel}
        variant="outline"
        elevated
        shape="round"
        size="md"
        tabIndex={isVisible ? 0 : -1}
        onClick={onClick}
      >
        {isDefined(Icon) && <Icon />}
      </IconButton>
    </StyledScrollOverlayContainer>
  );
};
