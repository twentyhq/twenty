import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import {
  CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { OnboardingStatus } from '~/generated/graphql';

const getNextOnboardingStatus = (
  currentOnboardingStatus: OnboardingStatus,
  workspaceMembers: WorkspaceMember[],
  currentWorkspace: CurrentWorkspace | null,
) => {
  if (currentOnboardingStatus === OnboardingStatus.ProfileCreation) {
    return OnboardingStatus.SyncEmail;
  }
  if (currentOnboardingStatus === OnboardingStatus.SyncEmail) {
    return workspaceMembers && workspaceMembers.length > 1
      ? null
      : OnboardingStatus.InviteTeam;
  }
  return currentWorkspace?.currentBillingSubscription
    ? OnboardingStatus.Completed
    : OnboardingStatus.CompletedWithoutSubscription;
};

export const useSetNextOnboardingStatus = () => {
  const setCurrentUser = useSetRecoilState(currentUserState);
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return useRecoilCallback(
    () => (currentOnboardingStatus: OnboardingStatus) => {
      setCurrentUser(
        (current) =>
          ({
            ...current,
            onboardingStatus: getNextOnboardingStatus(
              currentOnboardingStatus,
              workspaceMembers,
              currentWorkspace,
            ),
          }) as any,
      );
    },
    [setCurrentUser, workspaceMembers, currentWorkspace],
  );
};
