import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';

const StyledBaseContainer = styled.div`
  width: 24px;
`;

const StyledGroupContainer = styled(StyledBaseContainer)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

type NavigationDrawerItemsCollapsedContainerProps = {
  isGroup?: boolean;
  children: ReactNode;
};

export const NavigationDrawerItemsCollapsedContainer = ({
  isGroup = false,
  children,
}: NavigationDrawerItemsCollapsedContainerProps) => {
  const isSettingsPage = useIsSettingsPage();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );
  if (isNavigationDrawerExpanded || isSettingsPage) {
    return children;
  }
  if (!isGroup) {
    return <StyledBaseContainer>{children}</StyledBaseContainer>;
  }
  return <StyledGroupContainer>{children}</StyledGroupContainer>;
};
