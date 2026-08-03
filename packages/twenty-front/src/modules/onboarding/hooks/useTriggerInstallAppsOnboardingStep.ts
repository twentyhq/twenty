import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { TriggerInstallAppsOnboardingStepDocument } from '~/generated-metadata/graphql';

export const useTriggerInstallAppsOnboardingStep = () => {
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const [triggerInstallAppsOnboardingStep] = useMutation(
    TriggerInstallAppsOnboardingStepDocument,
  );

  return useCallback(
    async ({
      universalIdentifiers,
      isAutoSkipped,
    }: {
      universalIdentifiers: string[];
      isAutoSkipped: boolean;
    }) => {
      await triggerInstallAppsOnboardingStep({
        variables: { universalIdentifiers, isAutoSkipped },
      });
      setNextOnboardingStatus({
        isCurrentStepReversible:
          !isAutoSkipped && universalIdentifiers.length === 0,
      });
    },
    [triggerInstallAppsOnboardingStep, setNextOnboardingStatus],
  );
};
