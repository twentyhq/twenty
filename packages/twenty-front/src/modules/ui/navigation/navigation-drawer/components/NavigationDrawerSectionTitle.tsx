import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import React, { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight, Label } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTitle = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  height: ${themeCssVariables.spacing[5]};
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
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const isSettingsPage = useIsSettingsPage();
  const handleTitleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isDefined(onClick) && (isNavigationDrawerExpanded || isSettingsPage)) {
      onClick();
    }
  };

  return (
    <StyledTitle className="section-title-container">
      <StyledLabelContainer onClick={handleTitleClick}>
        <Label className="section-title-label">{label}</Label>
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
