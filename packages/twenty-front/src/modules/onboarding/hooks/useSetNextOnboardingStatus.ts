import { isDefined } from 'twenty-shared/utils';

import {
  type CurrentUser,
  currentUserState,
} from '@/auth/states/currentUserState';
import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

import { useCallback } from 'react';
import {
  OnboardingStatus,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useStore } from 'jotai';

type GetNextOnboardingStatusArgs = {
  currentUser: CurrentUser | null;
  currentWorkspace: CurrentWorkspace | null;
  calendarBookingPageId: string | null;
  isAccountSyncEnabled: boolean;
};

const getNextOnboardingStatus = ({
  currentUser,
  currentWorkspace,
  calendarBookingPageId,
  isAccountSyncEnabled,
}: GetNextOnboardingStatusArgs) => {
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
  const store = useStore();
  const currentUser = useRecoilValueV2(currentUserState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const calendarBookingPageId = useRecoilValueV2(calendarBookingPageIdState);
  const permissionMap = usePermissionFlagMap();
  const isAccountSyncEnabled =
    permissionMap[PermissionFlagType.CONNECTED_ACCOUNTS];

  return useCallback(() => {
    const nextOnboardingStatus = getNextOnboardingStatus({
      currentUser,
      currentWorkspace,
      calendarBookingPageId,
      isAccountSyncEnabled,
    });
    store.set(currentUserState.atom, (current) => {
      if (isDefined(current)) {
        return {
          ...current,
          onboardingStatus: nextOnboardingStatus,
        };
      }
      return current;
    });
  }, [
    currentUser,
    currentWorkspace,
    calendarBookingPageId,
    isAccountSyncEnabled,
    store,
  ]);
};
