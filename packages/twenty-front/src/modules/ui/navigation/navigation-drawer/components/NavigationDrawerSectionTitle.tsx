import { currentUserState } from '@/auth/states/currentUserState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { NavigationDrawerSectionTitleSkeletonLoader } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitleSkeletonLoader';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronRight, Label } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  .section-title-container:hover & {
    opacity: 1;
  }
`;

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
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const isSettingsPage = useIsSettingsPage();
  const currentUser = useAtomStateValue(currentUserState);
  const loading = useIsPrefetchLoading();
  const handleTitleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isDefined(onClick) && (isNavigationDrawerExpanded || isSettingsPage)) {
      onClick();
    }
  };

  if (loading && isDefined(currentUser)) {
    return <NavigationDrawerSectionTitleSkeletonLoader />;
  }

  const ChevronIcon = isOpen === true ? IconChevronDown : IconChevronRight;

  return (
    <StyledTitle className="section-title-container">
      <StyledLabelContainer onClick={handleTitleClick}>
        <Label className="section-title-label">{label}</Label>
        {isOpen !== undefined && (
          <StyledChevron>
            <ChevronIcon
              size="12px"
              stroke={themeCssVariables.icon.stroke.sm}
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
