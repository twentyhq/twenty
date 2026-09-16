import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import type React from 'react';
import { IconChevronRight } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledContainer = styled.span<{ isOpen: boolean }>`
  display: inline-flex;
  transform: rotate(${({ isOpen }) => (isOpen ? 90 : 0)}deg);
  transition: transform
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

type NavigationMenuItemFolderChevronProps = {
  isOpen: boolean;
};

export const NavigationMenuItemFolderChevron = ({
  isOpen,
}: NavigationMenuItemFolderChevronProps) => {
  const theme = useTheme();

  return (
    <StyledContainer isOpen={isOpen}>
      <IconChevronRight
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
        color={themeCssVariables.font.color.tertiary}
      />
    </StyledContainer>
  );
};

// Rotating a wrapper around the button keeps the icon component identity
// stable: passing an inline component to LightIconButton's Icon prop remounts
// the svg on every render, so the transition never runs.
const StyledButtonContainer = styled.span<{ isOpen: boolean }>`
  display: inline-flex;

  svg {
    transform: rotate(${({ isOpen }) => (isOpen ? 90 : 0)}deg);
    transition: transform
      calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  }

  @media (prefers-reduced-motion: reduce) {
    svg {
      transition: none;
    }
  }
`;

type NavigationMenuItemFolderChevronButtonProps = {
  isOpen: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const NavigationMenuItemFolderChevronButton = ({
  isOpen,
  onClick,
}: NavigationMenuItemFolderChevronButtonProps) => {
  const { t } = useLingui();

  return (
    <StyledButtonContainer isOpen={isOpen}>
      <LightIconButton
        Icon={IconChevronRight}
        size="small"
        accent="tertiary"
        aria-label={isOpen ? t`Collapse folder` : t`Expand folder`}
        onClick={onClick}
      />
    </StyledButtonContainer>
  );
};
