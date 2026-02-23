import React from 'react';

import { isAppMetadataReadyState } from '@/metadata-store/states/isAppMetadataReadyState';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { UserContext } from '@/users/contexts/UserContext';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const MetadataGater = ({ children }: React.PropsWithChildren) => {
  const isAppMetadataReady = useRecoilValueV2(isAppMetadataReadyState);
  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);
  const isLoggedIn = useIsLogged();
  const location = useLocation();

  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();

  const isOnExcludedPath =
    isMatchingLocation(location, AppPath.Verify) ||
    isMatchingLocation(location, AppPath.VerifyEmail) ||
    isMatchingLocation(location, AppPath.CreateWorkspace);

  const shouldShowLoader =
    (!isAppMetadataReady && isLoggedIn && !isOnExcludedPath) ||
    objectMetadataItems.length === 0;

  if (shouldShowLoader) {
    return <UserOrMetadataLoader />;
  }

  return (
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
