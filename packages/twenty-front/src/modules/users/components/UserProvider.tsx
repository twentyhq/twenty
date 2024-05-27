import React from 'react';
import { useRecoilValue } from 'recoil';

import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { AppPath } from '@/types/AppPath';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const isCurrentUserLoaded = useRecoilValue(isCurrentUserLoadedState);
  const isMatchingLocation = useIsMatchingLocation();

  return !isCurrentUserLoaded &&
    !isMatchingLocation(AppPath.CreateWorkspace) ? (
    <UserOrMetadataLoader />
  ) : (
    <>{children}</>
  );
};
