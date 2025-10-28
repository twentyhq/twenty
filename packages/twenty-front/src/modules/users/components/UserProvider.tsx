import React from 'react';
import { useRecoilValue } from 'recoil';

import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { UserContext } from '@/users/contexts/UserContext';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const isCurrentUserLoaded = useRecoilValue(isCurrentUserLoadedState);
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
