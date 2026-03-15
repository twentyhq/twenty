import React from 'react';

import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const MinimalMetadataGater = ({ children }: React.PropsWithChildren) => {
  const isMinimalMetadataReady = useAtomStateValue(isMinimalMetadataReadyState);
  const hasAccessTokenPair = useHasAccessTokenPair();
  const location = useLocation();

  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();

  const isOnExcludedPath =
    isMatchingLocation(location, AppPath.Verify) ||
    isMatchingLocation(location, AppPath.VerifyEmail) ||
    isMatchingLocation(location, AppPath.CreateWorkspace);

  const shouldShowLoader =
    !isMinimalMetadataReady && hasAccessTokenPair && !isOnExcludedPath;

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
