import styled from '@emotion/styled';

import { currentUserState } from '@/auth/states/currentUserState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { NavigationDrawerSectionTitleSkeletonLoader } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitleSkeletonLoader';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type NavigationDrawerSectionTitleProps = {
  onClick?: () => void;
  label: string;
};

const StyledTitle = styled.div<{ onClick?: () => void }>`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  height: ${({ theme }) => theme.spacing(5)};
  padding: ${({ theme }) => theme.spacing(1)};

  ${({ onClick, theme }) =>
    !isUndefinedOrNull(onClick)
      ? `&:hover {
          cursor: pointer;
          background-color:${theme.background.transparent.light};
        }`
      : ''}
`;

export const NavigationDrawerSectionTitle = ({
  onClick,
  label,
}: NavigationDrawerSectionTitleProps) => {
  const currentUser = useRecoilValue(currentUserState);
  const loading = useIsPrefetchLoading();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  const isSettingsPage = useIsSettingsPage();

  if (loading && isDefined(currentUser)) {
    return <NavigationDrawerSectionTitleSkeletonLoader />;
  }
  return (
    <StyledTitle
      onClick={
        isNavigationDrawerExpanded || isSettingsPage ? onClick : undefined
      }
    >
      {label}
    </StyledTitle>
  );
};
