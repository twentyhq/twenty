import React from 'react';
import { useRecoilValue } from 'recoil';

import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { AppPath } from '@/types/AppPath';
import { UserContext } from '@/users/contexts/UserContext';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const isCurrentUserLoaded = useRecoilValue(isCurrentUserLoadedState);
  const isMatchingLocation = useIsMatchingLocation();

  const dateTimeFormat = useRecoilValue(dateTimeFormatState);

  return !isCurrentUserLoaded &&
    !isMatchingLocation(AppPath.CreateWorkspace) ? (
    <UserOrMetadataLoader />
  ) : (
    <UserContext.Provider
      value={{
        dateFormat: dateTimeFormat.dateFormat,
        timeFormat: dateTimeFormat.timeFormat,
        timeZone: dateTimeFormat.timeZone,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
