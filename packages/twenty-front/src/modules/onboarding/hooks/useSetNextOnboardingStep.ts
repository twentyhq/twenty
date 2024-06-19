import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import {
  CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { OnboardingStep } from '~/generated/graphql';

const getNextOnboardingStep = (
  currentOnboardingStep: OnboardingStep,
  workspaceMembers: WorkspaceMember[],
  currentWorkspace: CurrentWorkspace | null,
) => {
  if (currentOnboardingStep === OnboardingStep.SyncEmail) {
    return workspaceMembers && workspaceMembers.length > 1
      ? null
      : OnboardingStep.InviteTeam;
  }
  return currentWorkspace?.currentBillingSubscription
    ? OnboardingStep.Completed
    : OnboardingStep.CompletedWithoutSubscription;
};

export const useSetNextOnboardingStep = () => {
  const setCurrentUser = useSetRecoilState(currentUserState);
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return useRecoilCallback(
    () => (currentOnboardingStep: OnboardingStep) => {
      setCurrentUser(
        (current) =>
          ({
            ...current,
            onboardingStep: getNextOnboardingStep(
              currentOnboardingStep,
              workspaceMembers,
              currentWorkspace,
            ),
          }) as any,
      );
    },
    [setCurrentUser, workspaceMembers, currentWorkspace],
  );
};
