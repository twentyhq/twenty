import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useIsMobile } from 'twenty-ui/utilities';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledTitle = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  height: ${themeCssVariables.spacing[7]};
  justify-content: space-between;
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing['0.5']};
  padding-top: ${themeCssVariables.spacing[1]};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
    cursor: pointer;
  }
`;

const StyledLabelContainer = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  cursor: inherit;
  display: flex;
  flex-grow: 1;
  font: inherit;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0;
  text-align: start;

  .section-title-container:is(:hover, :has(:focus-visible)) & {
    color: ${themeCssVariables.font.color.tertiary};
  }

  &:focus-visible {
    outline: ${themeCssVariables.spacing['0.5']} solid
      ${themeCssVariables.color.blue};
    outline-offset: ${themeCssVariables.spacing['0.5']};
  }
`;

const StyledChevron = styled.span`
  align-items: center;
  display: flex;
  opacity: 0;
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease;
  .section-title-container:is(:hover, :has(:focus-visible)) & {
    opacity: 1;
  }
`;

const MotionIconChevronRight = motion.create(IconChevronRight);

type StyledRightIconProps = {
  isMobile: boolean;
  $alwaysVisible: boolean;
};

const StyledRightIcon = styled.div<StyledRightIconProps>`
  cursor: pointer;
  opacity: ${({ isMobile, $alwaysVisible }) =>
    isMobile || $alwaysVisible ? 1 : 0};

  .section-title-container:is(:hover, :has(:focus-visible)) & {
    opacity: 1;
  }
`;

type NavigationDrawerSectionTitleProps = {
  onClick: () => void;
  label: string;
  rightIcon?: React.ReactNode;
  alwaysShowRightIcon?: boolean;
  isOpen?: boolean;
  'aria-controls'?: string;
};

export const NavigationDrawerSectionTitle = ({
  onClick,
  label,
  rightIcon,
  alwaysShowRightIcon = false,
  isOpen,
  'aria-controls': ariaControls,
}: NavigationDrawerSectionTitleProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();
  const handleTitleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isNavigationDrawerExpanded) {
      onClick();
    }
  };
  const preventPointerFocus = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  const keepActivationKeysFromDocumentHotkeys = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.stopPropagation();
    }
  };

  return (
    <StyledTitle className="section-title-container">
      <StyledLabelContainer
        type="button"
        onClick={handleTitleClick}
        onMouseDown={preventPointerFocus}
        onKeyDown={keepActivationKeysFromDocumentHotkeys}
        aria-expanded={isOpen}
        aria-controls={ariaControls}
      >
        <Text render={<span />} size="xs" weight="semibold">
          {label}
        </Text>
        {isDefined(isOpen) && (
          <StyledChevron aria-hidden="true">
            <MotionIconChevronRight
              initial={false}
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: theme.animation.duration.normal }}
              size="12px"
              stroke={theme.icon.stroke.lg}
              color={themeCssVariables.font.color.tertiary}
            />
          </StyledChevron>
        )}
      </StyledLabelContainer>
      {isDefined(rightIcon) && (
        <StyledRightIcon
          isMobile={isMobile}
          $alwaysVisible={alwaysShowRightIcon}
        >
          {rightIcon}
        </StyledRightIcon>
      )}
    </StyledTitle>
  );
};
