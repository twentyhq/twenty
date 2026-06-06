import { RecordIndexSkeletonLoader } from '@/object-record/record-index/components/RecordIndexSkeletonLoader';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const StyledRightPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]};
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
