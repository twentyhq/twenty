import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { workspacesState } from '@/auth/states/workspaces';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { getDateFormatFromWorkspaceDateFormat } from '@/localization/utils/getDateFormatFromWorkspaceDateFormat';
import { getTimeFormatFromWorkspaceTimeFormat } from '@/localization/utils/getTimeFormatFromWorkspaceTimeFormat';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { useGetCurrentUserQuery } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const UserProviderEffect = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [isCurrentUserLoaded, setIsCurrentUserLoaded] = useRecoilState(
    isCurrentUserLoadedState,
  );
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setWorkspaces = useSetRecoilState(workspacesState);

  const setDateTimeFormat = useSetRecoilState(dateTimeFormatState);

  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  const { loading: queryLoading, data: queryData } = useGetCurrentUserQuery({
    skip: isCurrentUserLoaded,
  });

  useEffect(() => {
    if (!queryLoading) {
      setIsLoading(false);
      setIsCurrentUserLoaded(true);
    }

    if (!isDefined(queryData?.currentUser)) return;

    setCurrentUser(queryData.currentUser);
    setCurrentWorkspace(queryData.currentUser.defaultWorkspace);

    const { workspaceMember, workspaces: userWorkspaces } =
      queryData.currentUser;

    if (isDefined(workspaceMember)) {
      setCurrentWorkspaceMember({
        ...workspaceMember,
        colorScheme: (workspaceMember.colorScheme as ColorScheme) ?? 'Light',
        locale: workspaceMember.locale ?? 'en',
      });

      // TODO: factorize
      setDateTimeFormat({
        timeZone:
          workspaceMember.timeZone && workspaceMember.timeZone !== 'system'
            ? workspaceMember.timeZone
            : detectTimeZone(),
        dateFormat: isDefined(workspaceMember.dateFormat)
          ? getDateFormatFromWorkspaceDateFormat(workspaceMember.dateFormat)
          : detectDateFormat(),
        timeFormat: isDefined(workspaceMember.timeFormat)
          ? getTimeFormatFromWorkspaceTimeFormat(workspaceMember.timeFormat)
          : detectTimeFormat(),
      });
    }

    if (isDefined(userWorkspaces)) {
      const workspaces = userWorkspaces
        .map(({ workspace }) => workspace)
        .filter(isDefined);

      setWorkspaces(workspaces);
    }
  }, [
    setCurrentUser,
    isLoading,
    queryLoading,
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    setWorkspaces,
    queryData?.currentUser,
    setIsCurrentUserLoaded,
    setDateTimeFormat,
  ]);

  return <></>;
};
