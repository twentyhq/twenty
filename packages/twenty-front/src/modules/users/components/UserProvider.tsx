import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { AppPath } from '@/types/AppPath';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale.util';
import { UserContext } from '@/users/contexts/UserContext';
import { enUS } from 'date-fns/locale';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const isCurrentUserLoaded = useRecoilValue(isCurrentUserLoadedState);
  const { isMatchingLocation } = useIsMatchingLocation();

  const dateTimeFormat = useRecoilValue(dateTimeFormatState);

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [locale, setLocale] = useState<Locale | null>();

  useEffect(() => {
    getDateFnsLocale(currentWorkspaceMember?.locale).then((loc) => {
      setLocale(loc);
    });
  }, [currentWorkspaceMember?.locale]);

  return !isCurrentUserLoaded &&
    !isMatchingLocation(AppPath.Verify) &&
    !isMatchingLocation(AppPath.VerifyEmail) &&
    !isMatchingLocation(AppPath.CreateWorkspace) ? (
    <UserOrMetadataLoader />
  ) : (
    <UserContext.Provider
      value={{
        dateFormat: dateTimeFormat.dateFormat,
        timeFormat: dateTimeFormat.timeFormat,
        timeZone: dateTimeFormat.timeZone,
        dateFnsLocale: locale ?? enUS,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
