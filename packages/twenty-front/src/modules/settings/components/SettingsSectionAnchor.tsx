import { styled } from '@linaria/react';
import { type AnimationEvent, type ReactNode, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme';

import { useSettingsSectionAnchorScroll } from '@/settings/hooks/useSettingsSectionAnchorScroll';
import { parseTabRouteHash } from '@/ui/layout/tab-list/utils/parseTabRouteHash';

const StyledAnchor = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  margin: calc(-1 * ${themeCssVariables.spacing[2]});
  padding: ${themeCssVariables.spacing[2]};
  scroll-margin-top: ${themeCssVariables.spacing[4]};

  &[data-highlighted='true'] {
    animation: settings-section-anchor-highlight
      calc(${themeCssVariables.animation.duration.slow} * 1s) ease-out;
  }

  @keyframes settings-section-anchor-highlight {
    from {
      background-color: ${themeCssVariables.accent.tertiary};
    }
    to {
      background-color: transparent;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-highlighted='true'] {
      animation: none;
    }
  }
`;

type SettingsSectionAnchorProps = {
  sectionId: string;
  children: ReactNode;
};

export const SettingsSectionAnchor = ({
  sectionId,
  children,
}: SettingsSectionAnchorProps) => {
  const { hash, key: locationKey } = useLocation();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [highlightEndedLocationKey, setHighlightEndedLocationKey] = useState<
    string | null
  >(null);

  const isTargeted = parseTabRouteHash(hash).sectionId === sectionId;
  const isHighlighted = isTargeted && highlightEndedLocationKey !== locationKey;

  useSettingsSectionAnchorScroll({ anchorRef, isTargeted, locationKey });

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setHighlightEndedLocationKey(locationKey);
    }
  };

  return (
    <StyledAnchor
      ref={anchorRef}
      data-highlighted={isHighlighted}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </StyledAnchor>
  );
};
