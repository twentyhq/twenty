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
    async (universalIdentifiers: string[]) => {
      await triggerInstallAppsOnboardingStep({
        variables: { universalIdentifiers },
      });
      setNextOnboardingStatus();
    },
    [triggerInstallAppsOnboardingStep, setNextOnboardingStatus],
  );
};
