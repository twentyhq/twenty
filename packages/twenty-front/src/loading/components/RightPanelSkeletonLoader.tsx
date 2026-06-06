import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { PageContentSkeletonLoader } from '~/loading/components/PageContentSkeletonLoader';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const StyledRightPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// The metadata gater shows this loader for the whole app on a full reload, so
// settings needs its own rounded-card skeleton here to match in-app loading.
export const RightPanelSkeletonLoader = () => {
  const location = useLocation();
  const isSettingsPage = isMatchingLocation(location, AppPath.SettingsCatchAll);

  return (
    <StyledRightPanelContainer>
      {isSettingsPage ? (
        <SettingsSkeletonLoader />
      ) : (
        <PageContentSkeletonLoader />
      )}
    </StyledRightPanelContainer>
  );
};
