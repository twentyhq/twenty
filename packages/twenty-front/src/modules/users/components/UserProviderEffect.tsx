import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceDeletedMembersState } from '@/auth/states/currentWorkspaceDeletedMembersStates';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { workspacesState } from '@/auth/states/workspaces';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { getDateFormatFromWorkspaceDateFormat } from '@/localization/utils/getDateFormatFromWorkspaceDateFormat';
import { getTimeFormatFromWorkspaceTimeFormat } from '@/localization/utils/getTimeFormatFromWorkspaceTimeFormat';
import { AppPath } from '@/types/AppPath';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale.util';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { enUS } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceMember } from '~/generated-metadata/graphql';
import { useGetCurrentUserQuery } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const UserProviderEffect = () => {
  const location = useLocation();

  const [isCurrentUserLoaded, setIsCurrentUserLoaded] = useRecoilState(
    isCurrentUserLoadedState,
  );

  const updateLocaleCatalog = useRecoilCallback(
    ({ snapshot, set }) =>
      async (newLocale: keyof typeof APP_LOCALES) => {
        const localeValue = snapshot.getLoadable(dateLocaleState).getValue();
        if (localeValue.locale !== newLocale) {
          getDateFnsLocale(newLocale).then((localeCatalog) => {
            set(dateLocaleState, {
              locale: newLocale,
              localeCatalog: localeCatalog || enUS,
            });
          });
        }
      },
    [],
  );

  const processCurrentUserData = useRecoilCallback(
    ({ set }) =>
      (queryData: any, queryLoading: boolean, skipQuery: boolean) => {
        if (!queryLoading) {
          set(isCurrentUserLoadedState, true);
        }

        if (!isDefined(queryData?.currentUser) || skipQuery) {
          return;
        }

        set(currentUserState, queryData.currentUser);

        if (isDefined(queryData.currentUser.currentWorkspace)) {
          set(currentWorkspaceState, {
            ...queryData.currentUser.currentWorkspace,
            defaultRole:
              queryData.currentUser.currentWorkspace.defaultRole ?? null,
          });
        }

        if (isDefined(queryData.currentUser.currentUserWorkspace)) {
          set(
            currentUserWorkspaceState,
            queryData.currentUser.currentUserWorkspace,
          );
        }

        const {
          workspaceMember,
          workspaceMembers,
          deletedWorkspaceMembers,
          workspaces: userWorkspaces,
        } = queryData.currentUser;

        const affectDefaultValuesOnEmptyWorkspaceMemberFields = (
          workspaceMember: WorkspaceMember,
        ) => {
          return {
            ...workspaceMember,
            colorScheme:
              (workspaceMember.colorScheme as ColorScheme) ?? 'Light',
            locale:
              (workspaceMember.locale as keyof typeof APP_LOCALES) ??
              SOURCE_LOCALE,
          };
        };

        if (isDefined(workspaceMember)) {
          const updatedWorkspaceMember =
            affectDefaultValuesOnEmptyWorkspaceMemberFields(workspaceMember);
          set(currentWorkspaceMemberState, updatedWorkspaceMember);

          updateLocaleCatalog(updatedWorkspaceMember.locale);

          // TODO: factorize
          set(dateTimeFormatState, {
            timeZone:
              workspaceMember.timeZone && workspaceMember.timeZone !== 'system'
                ? workspaceMember.timeZone
                : detectTimeZone(),
            dateFormat: isDefined(workspaceMember.dateFormat)
              ? getDateFormatFromWorkspaceDateFormat(workspaceMember.dateFormat)
              : DateFormat[detectDateFormat()],
            timeFormat: isDefined(workspaceMember.timeFormat)
              ? getTimeFormatFromWorkspaceTimeFormat(workspaceMember.timeFormat)
              : TimeFormat[detectTimeFormat()],
          });

          dynamicActivate(
            (workspaceMember.locale as keyof typeof APP_LOCALES) ??
              SOURCE_LOCALE,
          );
        }

        if (isDefined(workspaceMembers)) {
          set(
            currentWorkspaceMembersState,
            workspaceMembers.map(
              affectDefaultValuesOnEmptyWorkspaceMemberFields,
            ) ?? [],
          );
        }

        if (isDefined(deletedWorkspaceMembers)) {
          set(currentWorkspaceDeletedMembersState, deletedWorkspaceMembers);
        }

        if (isDefined(userWorkspaces)) {
          const workspaces = userWorkspaces
            .map(({ workspace }: { workspace: any }) => workspace)
            .filter(isDefined);

          set(workspacesState, workspaces);
        }
      },
    [updateLocaleCatalog],
  );

  const skipQuery =
    isCurrentUserLoaded ||
    isMatchingLocation(location, AppPath.Verify) ||
    isMatchingLocation(location, AppPath.VerifyEmail);

  const { loading: queryLoading, data: queryData } = useGetCurrentUserQuery({
    skip: skipQuery,
  });

  useEffect(() => {
    processCurrentUserData(queryData, queryLoading, skipQuery);
  }, [processCurrentUserData, queryData, queryLoading, skipQuery]);

  return <></>;
};
