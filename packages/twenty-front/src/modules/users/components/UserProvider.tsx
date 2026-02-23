import React from 'react';

import { isAppLoadingState } from '@/app/states/isAppLoadingState';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { UserContext } from '@/users/contexts/UserContext';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const isAppLoading = useRecoilValueV2(isAppLoadingState);
  const isLoggedIn = useIsLogged();
  const location = useLocation();

  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();

  const shouldShowLoader =
    isAppLoading &&
    isLoggedIn &&
    !isMatchingLocation(location, AppPath.Verify) &&
    !isMatchingLocation(location, AppPath.VerifyEmail) &&
    !isMatchingLocation(location, AppPath.CreateWorkspace);

  return shouldShowLoader ? (
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
