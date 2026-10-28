import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { NAVIGATION_DRAWER_ITEM_HOVER_BACKGROUND } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerItemHoverBackground';
import { EASE_OUT_CSS } from '@/ui/theme/constants/EaseOutCss';
import { useIsMobile } from 'twenty-ui/utilities';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledDisplayLabel = styled(Text)`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.02em;
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ${EASE_OUT_CSS};

  .section-title-container:hover & {
    color: ${themeCssVariables.font.color.secondary};
  }
`;

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
  transition: background-color
    calc(${themeCssVariables.animation.duration.fast} * 1s) ${EASE_OUT_CSS};

  &:hover {
    background-color: ${NAVIGATION_DRAWER_ITEM_HOVER_BACKGROUND};
    cursor: pointer;
  }
`;

const StyledLabelContainer = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledChevron = styled.div`
  align-items: center;
  display: flex;
  opacity: 0;
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
    ${EASE_OUT_CSS};
  .section-title-container:hover & {
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

  .section-title-container:hover & {
    opacity: 1;
  }
`;

type NavigationDrawerSectionTitleProps = {
  onClick?: () => void;
  label: string;
  rightIcon?: React.ReactNode;
  alwaysShowRightIcon?: boolean;
  isOpen?: boolean;
};

export const NavigationDrawerSectionTitle = ({
  onClick,
  label,
  rightIcon,
  alwaysShowRightIcon = false,
  isOpen,
}: NavigationDrawerSectionTitleProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();
  const handleTitleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isDefined(onClick) && isNavigationDrawerExpanded) {
      onClick();
    }
  };

  return (
    <StyledTitle className="section-title-container">
      <StyledLabelContainer onClick={handleTitleClick}>
        <StyledDisplayLabel>{label}</StyledDisplayLabel>
        {isOpen !== undefined && (
          <StyledChevron>
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
