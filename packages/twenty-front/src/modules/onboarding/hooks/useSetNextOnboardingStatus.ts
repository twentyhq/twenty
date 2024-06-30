import { useRecoilCallback, useRecoilValue } from 'recoil';

import { CurrentUser, currentUserState } from '@/auth/states/currentUserState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { OnboardingStatus } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

const getNextOnboardingStatus = (
  currentUser: CurrentUser | null,
  workspaceMembers: WorkspaceMember[],
) => {
  if (currentUser?.onboardingStatus === OnboardingStatus.ProfileCreation) {
    return OnboardingStatus.SyncEmail;
  }
  if (
    currentUser?.onboardingStatus === OnboardingStatus.SyncEmail &&
    workspaceMembers.length === 1
  ) {
    return OnboardingStatus.InviteTeam;
  }
  return OnboardingStatus.Completed;
};

export const useSetNextOnboardingStatus = () => {
  const { records: workspaceMembers, loading } =
    useFindManyRecords<WorkspaceMember>({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    });
  const currentUser = useRecoilValue(currentUserState);

  const setNextOnboardingStatus = useRecoilCallback(
    ({ set }) =>
      () => {
        const nextOnboardingStatus = getNextOnboardingStatus(
          currentUser,
          workspaceMembers,
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
    [workspaceMembers, currentUser],
  );
  return {
    loading,
    setNextOnboardingStatus,
  };
};
