import { useRecoilCallback, useRecoilValue } from 'recoil';

import {
  type CurrentUser,
  currentUserState,
} from '@/auth/states/currentUserState';
import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { isDefined } from 'twenty-shared/utils';
import { OnboardingStatus, PermissionFlagType } from '~/generated/graphql';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';

const getNextOnboardingStatus = (
  currentUser: CurrentUser | null,
  currentWorkspace: CurrentWorkspace | null,
  calendarBookingPageId: string | null,
  isAccountSyncEnabled: boolean,
) => {
  if (currentUser?.onboardingStatus === OnboardingStatus.WORKSPACE_ACTIVATION) {
    return OnboardingStatus.PROFILE_CREATION;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.PROFILE_CREATION) {
    if (currentWorkspace?.workspaceMembersCount === 1) {
      if (isAccountSyncEnabled) {
        return OnboardingStatus.SYNC_EMAIL;
      }
      return OnboardingStatus.INVITE_TEAM;
    }
    return OnboardingStatus.COMPLETED;
  }
  if (
    currentUser?.onboardingStatus === OnboardingStatus.SYNC_EMAIL &&
    currentWorkspace?.workspaceMembersCount === 1
  ) {
    return OnboardingStatus.INVITE_TEAM;
  }
  if (currentUser?.onboardingStatus === OnboardingStatus.INVITE_TEAM) {
    return isDefined(calendarBookingPageId)
      ? OnboardingStatus.BOOK_ONBOARDING
      : OnboardingStatus.COMPLETED;
  }
  if (currentUser?.onboardingStatus === OnboardingStatus.BOOK_ONBOARDING) {
    return OnboardingStatus.COMPLETED;
  }
  return OnboardingStatus.COMPLETED;
};

export const useSetNextOnboardingStatus = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const calendarBookingPageId = useRecoilValue(calendarBookingPageIdState);
  const permissionMap = usePermissionFlagMap();
  const isAccountSyncEnabled =
    permissionMap[PermissionFlagType.CONNECTED_ACCOUNTS];

  return useRecoilCallback(
    ({ set }) =>
      () => {
        const nextOnboardingStatus = getNextOnboardingStatus(
          currentUser,
          currentWorkspace,
          calendarBookingPageId,
          isAccountSyncEnabled,
        );
        set(currentUserState, (current) => {
          if (isDefined(current)) {
            return {
              ...current,
              onboardingStatus: nextOnboardingStatus,
            };
          }
          return current;
        });
      },
    [
      currentUser,
      currentWorkspace,
      calendarBookingPageId,
      isAccountSyncEnabled,
    ],
  );
};
