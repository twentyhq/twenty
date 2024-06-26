import { useRecoilCallback, useRecoilValue } from 'recoil';

import { CurrentUser, currentUserState } from '@/auth/states/currentUserState';
import {
  CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { OnboardingStatus } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

const getNextOnboardingStatus = (
  currentUser: CurrentUser | null,
  workspaceMembers: WorkspaceMember[],
  currentWorkspace: CurrentWorkspace | null,
) => {
  if (currentUser?.onboardingStatus === OnboardingStatus.ProfileCreation) {
    return OnboardingStatus.SyncEmail;
  }
  if (
    currentUser?.onboardingStatus === OnboardingStatus.SyncEmail &&
    workspaceMembers?.length <= 1
  ) {
    return OnboardingStatus.InviteTeam;
  }
  return currentWorkspace?.currentBillingSubscription
    ? OnboardingStatus.Completed
    : OnboardingStatus.CompletedWithoutSubscription;
};

export const useSetNextOnboardingStatus = () => {
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const currentUser = snapshot.getLoadable(currentUserState).getValue();
        const nextOnboardingStatus = getNextOnboardingStatus(
          currentUser,
          workspaceMembers,
          currentWorkspace,
        );
        set(currentUserState, (current) => {
          if (isDefined(current)) {
            return {
              ...current,
              onboardingStatus: nextOnboardingStatus as OnboardingStatus,
            };
          }
          return current;
        });
      },
    [workspaceMembers, currentWorkspace],
  );
};
