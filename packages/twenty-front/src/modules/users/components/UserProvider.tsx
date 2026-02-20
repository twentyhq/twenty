import React from 'react';

import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { UserContext } from '@/users/contexts/UserContext';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const isCurrentUserLoaded = useRecoilValueV2(isCurrentUserLoadedState);
  const location = useLocation();

  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();

  return !isCurrentUserLoaded &&
    !isMatchingLocation(location, AppPath.Verify) &&
    !isMatchingLocation(location, AppPath.VerifyEmail) &&
    !isMatchingLocation(location, AppPath.CreateWorkspace) ? (
    <UserOrMetadataLoader />
  ) : (
    <UserContext.Provider
      value={{
        dateFormat,
        timeFormat,
        timeZone,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
