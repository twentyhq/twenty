import { currentUserState } from '@/auth/states/currentUserState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { NavigationDrawerSectionTitleSkeletonLoader } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitleSkeletonLoader';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Label } from 'twenty-ui/display';

const StyledTitle = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: ${({ theme }) => theme.spacing(5)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(0.5)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledLabelContainer = styled.div`
  flex-grow: 1;
`;

type StyledRightIconProps = {
  isMobile: boolean;
};

const StyledRightIcon = styled.div<StyledRightIconProps>`
  cursor: pointer;
  opacity: ${({ isMobile }) => (isMobile ? 1 : 0)};

  .section-title-container:hover & {
    opacity: 1;
  }
`;

type NavigationDrawerSectionTitleProps = {
  onClick?: () => void;
  label: string;
  rightIcon?: React.ReactNode;
};

export const NavigationDrawerSectionTitle = ({
  onClick,
  label,
  rightIcon,
}: NavigationDrawerSectionTitleProps) => {
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );
  const isSettingsPage = useIsSettingsPage();
  const currentUser = useRecoilValue(currentUserState);
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

  return (
    <StyledTitle className="section-title-container">
      <StyledLabelContainer onClick={handleTitleClick}>
        <Label>{label}</Label>
      </StyledLabelContainer>
      {rightIcon && (
        <StyledRightIcon isMobile={isMobile}>{rightIcon}</StyledRightIcon>
      )}
    </StyledTitle>
  );
};
