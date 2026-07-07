import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { WELCOME_HALFTONE_DASHES } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneDots';

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

const StyledDash = styled.line`
  animation-delay: var(--dot-delay, 0s);
  animation-duration: 0.5s;
  animation-fill-mode: both;
  animation-name: welcomeDashIn;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  stroke: var(--welcome-dot-color);
  stroke-linecap: round;

  @keyframes welcomeDashIn {
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
    {WELCOME_HALFTONE_DASHES.map(([x1, x2, y, strokeWidth]) => {
      const centerX = (x1 + x2) / 2;
      const distance = Math.hypot(
        centerX - VIEWBOX_CENTER_X,
        y - VIEWBOX_CENTER_Y,
      );
      const delay = (distance / MAX_CENTER_DISTANCE) * BLOOM_SPREAD_SECONDS;

      return (
        <StyledDash
          key={`${x1}-${x2}-${y}`}
          x1={x1}
          y1={y}
          x2={x2}
          y2={y}
          strokeWidth={strokeWidth}
          style={{ '--dot-delay': `${delay.toFixed(3)}s` } as CSSProperties}
        />
      );
    })}
  </StyledSvg>
);
