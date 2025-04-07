import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IconX } from 'twenty-ui/display';
import { UndecoratedLink } from 'twenty-ui/navigation';

type NavigationDrawerBackButtonProps = {
  title: string;
};

const StyledIconAndButtonContainer = styled.button`
  align-items: center;
  background: inherit;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1.5, 1)};
  width: 100%;
  font-family: ${({ theme }) => theme.font.family};
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.spacing(5)};
`;

export const NavigationDrawerBackButton = ({
  title,
}: NavigationDrawerBackButtonProps) => {
  const theme = useTheme();
  const navigationMemorizedUrl = useRecoilValue(navigationMemorizedUrlState);

  const setIsNavigationDrawerExpanded = useSetRecoilState(
    isNavigationDrawerExpandedState,
  );
  const navigationDrawerExpandedMemorized = useRecoilValue(
    navigationDrawerExpandedMemorizedState,
  );

  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  if (isWorkspaceSuspended) {
    return <StyledContainer />;
  }

  return (
    <StyledContainer>
      <UndecoratedLink
        to={navigationMemorizedUrl}
        replace
        onClick={() =>
          setIsNavigationDrawerExpanded(navigationDrawerExpandedMemorized)
        }
      >
        <StyledIconAndButtonContainer>
          <IconX
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.lg}
            color={theme.font.color.tertiary}
          />
          <span>{title}</span>
        </StyledIconAndButtonContainer>
      </UndecoratedLink>
    </StyledContainer>
  );
};
