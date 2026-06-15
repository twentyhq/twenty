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
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import { useCallback } from 'react';
import {
  FeatureFlagKey,
  OnboardingStatus,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useStore } from 'jotai';

type GetNextOnboardingStatusArgs = {
  currentUser: CurrentUser | null;
  currentWorkspace: CurrentWorkspace | null;
  calendarBookingPageId: string | null;
  isAccountSyncEnabled: boolean;
  isInviteSuggestionsEnabled: boolean;
};

const getNextOnboardingStatus = ({
  currentUser,
  currentWorkspace,
  calendarBookingPageId,
  isAccountSyncEnabled,
  isInviteSuggestionsEnabled,
}: GetNextOnboardingStatusArgs) => {
  const onboardingStatus = currentUser?.onboardingStatus;
  const isSoloWorkspace = currentWorkspace?.workspaceMembersCount === 1;

  if (onboardingStatus === OnboardingStatus.WORKSPACE_ACTIVATION) {
    if (isInviteSuggestionsEnabled && isAccountSyncEnabled) {
      return OnboardingStatus.SYNC_EMAIL;
    }
    return OnboardingStatus.PROFILE_CREATION;
  }

  if (onboardingStatus === OnboardingStatus.SYNC_EMAIL) {
    if (isInviteSuggestionsEnabled) {
      return OnboardingStatus.PROFILE_CREATION;
    }
    if (isSoloWorkspace) {
      return OnboardingStatus.INVITE_TEAM;
    }
    return OnboardingStatus.COMPLETED;
  }

  if (onboardingStatus === OnboardingStatus.PROFILE_CREATION) {
    if (!isSoloWorkspace) {
      return OnboardingStatus.COMPLETED;
    }
    if (isInviteSuggestionsEnabled) {
      return OnboardingStatus.INVITE_TEAM;
    }
    if (isAccountSyncEnabled) {
      return OnboardingStatus.SYNC_EMAIL;
    }
    return OnboardingStatus.INVITE_TEAM;
  }

  if (onboardingStatus === OnboardingStatus.INVITE_TEAM) {
    return isDefined(calendarBookingPageId)
      ? OnboardingStatus.BOOK_ONBOARDING
      : OnboardingStatus.COMPLETED;
  }

  if (onboardingStatus === OnboardingStatus.BOOK_ONBOARDING) {
    return OnboardingStatus.COMPLETED;
  }

  return OnboardingStatus.COMPLETED;
};

export const useSetNextOnboardingStatus = () => {
  const store = useStore();
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const permissionMap = usePermissionFlagMap();
  const isAccountSyncEnabled =
    permissionMap[PermissionFlagType.CONNECTED_ACCOUNTS];
  const isInviteSuggestionsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ONBOARDING_INVITE_SUGGESTIONS_ENABLED,
  );

  return useCallback(() => {
    const nextOnboardingStatus = getNextOnboardingStatus({
      currentUser,
      currentWorkspace,
      calendarBookingPageId,
      isAccountSyncEnabled,
      isInviteSuggestionsEnabled,
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
    isInviteSuggestionsEnabled,
    store,
  ]);
};
