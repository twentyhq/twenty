import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconPlayerPlay } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type HeroPlayButtonProps = {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
};

// Sits above a hero image and signals "this thing has a video to watch".
// Uses the workspace surface tokens so the disc adapts to theme: in light
// mode it reads as a soft white disc with a muted-gray triangle (per the
// design); in dark mode it reads as a dark disc with a light-gray triangle —
// still legible on the matching dark illustration.
const StyledButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: none;
  border-radius: 50%;
  box-shadow: ${themeCssVariables.boxShadow.strong};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  padding: 0;
  transition:
    transform 120ms ease-out,
    background-color 120ms ease-out;
  width: 44px;

  &:hover {
    background: ${themeCssVariables.background.secondary};
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.border.color.blue};
    outline-offset: 2px;
  }
`;

export const HeroPlayButton = ({
  onClick,
  ariaLabel = 'Play video',
  className,
}: HeroPlayButtonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledButton
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
    >
      {/* No fill — the design uses the stroked outline directly from Tabler */}
      <IconPlayerPlay size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
    </StyledButton>
  );
};
