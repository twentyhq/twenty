import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { WELCOME_HALFTONE_DOTS } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneDots';

import './welcomeHalftone.css';

const VIEWBOX_CENTER_X = 148.5;
const VIEWBOX_CENTER_Y = 119.5;
const MAX_CENTER_DISTANCE = Math.hypot(VIEWBOX_CENTER_X, VIEWBOX_CENTER_Y);
const BLOOM_SPREAD_SECONDS = 0.9;

const StyledSvg = styled.svg`
  display: block;
  height: auto;
  user-select: none;
  width: 100%;
`;

const StyledDot = styled.circle`
  animation-delay: var(--dot-delay, 0s);
  animation-duration: 0.5s;
  animation-fill-mode: both;
  animation-name: welcomeDotIn;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  fill: var(--welcome-dot-color);
  opacity: 0;

  @keyframes welcomeDotIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
  }
`;

export const HalftoneLogo = () => (
  <StyledSvg
    viewBox="0 0 297.037 239.098"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    {WELCOME_HALFTONE_DOTS.map(([cx, cy, r]) => {
      const distance = Math.hypot(cx - VIEWBOX_CENTER_X, cy - VIEWBOX_CENTER_Y);
      const delay = (distance / MAX_CENTER_DISTANCE) * BLOOM_SPREAD_SECONDS;

      return (
        <StyledDot
          key={`${cx}-${cy}-${r}`}
          cx={cx}
          cy={cy}
          r={r}
          style={{ '--dot-delay': `${delay.toFixed(3)}s` } as CSSProperties}
        />
      );
    })}
  </StyledSvg>
);
