import { isOnboardingV2State } from '@/auth/states/isOnboardingV2State';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { WorkspaceActivation } from '~/pages/onboarding/WorkspaceActivation';
import { WorkspaceActivationV2 } from '~/pages/onboarding/WorkspaceActivationV2';

export const WorkspaceActivationRouter = () => {
  const isOnboardingV2 = useAtomStateValue(isOnboardingV2State);

  return isOnboardingV2 ? <WorkspaceActivationV2 /> : <WorkspaceActivation />;
};
