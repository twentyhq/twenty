import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
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

    .section-title-label {
      color: ${themeCssVariables.font.color.tertiary};
    }
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
    ease;
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
        <StyledDisplayLabel className="section-title-label">
          {label}
        </StyledDisplayLabel>
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

const StyledDisplayLabel = styled(Text)`
  color: var(--t-font-color-light);
  font-size: 11px;
  font-weight: var(--t-font-weight-semi-bold);
`;
