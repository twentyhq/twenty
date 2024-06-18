import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { OnboardingStep } from '~/generated/graphql';

const getNextOnboardingStep = (
  currentOnboardingStep: OnboardingStep,
  workspaceMembers: WorkspaceMember[],
) => {
  if (currentOnboardingStep === OnboardingStep.SyncEmail) {
    return workspaceMembers && workspaceMembers.length > 1
      ? null
      : OnboardingStep.InviteTeam;
  }
  return null;
};

export const useSetNextOnboardingStep = () => {
  const setCurrentUser = useSetRecoilState(currentUserState);
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  return useRecoilCallback(
    () => (currentOnboardingStep: OnboardingStep) => {
      setCurrentUser(
        (current) =>
          ({
            ...current,
            onboardingStep: getNextOnboardingStep(
              currentOnboardingStep,
              workspaceMembers,
            ),
          }) as any,
      );
    },
    [setCurrentUser, workspaceMembers],
  );
};
