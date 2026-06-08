import { RecordIndexSkeletonLoader } from '@/object-record/record-index/components/RecordIndexSkeletonLoader';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const StyledRightPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const RightPanelSkeletonLoader = () => {
  const location = useLocation();
  const isSettingsPage = isMatchingLocation(location, AppPath.SettingsCatchAll);

  return (
    <StyledRightPanelContainer>
      {isSettingsPage ? (
        <SettingsSkeletonLoader />
      ) : (
        <RecordIndexSkeletonLoader />
      )}
    </StyledRightPanelContainer>
  );
};
