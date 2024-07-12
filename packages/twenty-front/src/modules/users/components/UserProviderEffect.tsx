import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { workspacesState } from '@/auth/states/workspaces';
import { dateTimeFormatState } from '@/workspace-member/states/dateTimeFormatState';
import { detectTimeZone } from '@/workspace-member/utils/detectTimeZone';
import { getDateFormatFromWorkspaceEnum } from '@/workspace-member/utils/formatDateLabel';
import { getTimeFormatFromWorkspaceEnum } from '@/workspace-member/utils/formatTimeLabel';
import {
  useGetCurrentUserQuery,
  WorkspaceMemberColorSchemeEnum,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const UserProviderEffect = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [isCurrentUserLoaded, setIsCurrentUserLoaded] = useRecoilState(
    isCurrentUserLoadedState,
  );
  const setDateTimeFormat = useSetRecoilState(dateTimeFormatState);
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setWorkspaces = useSetRecoilState(workspacesState);

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
        colorScheme:
          (workspaceMember.colorScheme as WorkspaceMemberColorSchemeEnum) ??
          WorkspaceMemberColorSchemeEnum.Light,
      });

      setDateTimeFormat({
        timeZone:
          workspaceMember.timeZone === 'system'
            ? detectTimeZone()
            : workspaceMember.timeZone,
        dateFormat: getDateFormatFromWorkspaceEnum(workspaceMember.dateFormat),
        timeFormat: getTimeFormatFromWorkspaceEnum(workspaceMember.timeFormat),
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
    setDateTimeFormat,
    setWorkspaces,
    queryData?.currentUser,
    setIsCurrentUserLoaded,
  ]);

  return <></>;
};
