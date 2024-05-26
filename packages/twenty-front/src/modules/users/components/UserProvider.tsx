import React from 'react';
import { useRecoilValue } from 'recoil';

import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const isCurrentUserLoaded = useRecoilValue(isCurrentUserLoadedState);

  return !isCurrentUserLoaded ? <UserOrMetadataLoader /> : <>{children}</>;
};
