import { type OnboardingStepHistoryEffect } from '@/onboarding/types/OnboardingStepHistoryEffect';

export const getInstallAppsStepHistoryEffect = ({
  universalIdentifiers,
  isAutoSkipped,
}: {
  universalIdentifiers: string[];
  isAutoSkipped: boolean;
}): OnboardingStepHistoryEffect => {
  if (universalIdentifiers.length > 0) {
    return 'clearAfterIrreversibleStep';
  }

  return isAutoSkipped ? 'leaveUnchanged' : 'recordAsReversible';
};
