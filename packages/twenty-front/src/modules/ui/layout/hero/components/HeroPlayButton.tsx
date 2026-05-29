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
// Theme-invariant on purpose: the illustration underneath can be light or
// dark, so we pin the disc to a soft white with a stroked medium-gray
// triangle — restrained and watermark-like rather than the chunky
// YouTube-style filled triangle. Designed for reuse across hero images.
const StyledButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  box-shadow: ${themeCssVariables.boxShadow.strong};
  color: #6b7280;
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
    background: #ffffff;
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
      <IconPlayerPlay
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.md}
      />
    </StyledButton>
  );
};
