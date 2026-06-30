import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { CompleteInstallAppsOnboardingStepDocument } from '~/generated-metadata/graphql';

export const useCompleteInstallAppsOnboardingStep = () => {
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const [completeInstallAppsOnboardingStep] = useMutation(
    CompleteInstallAppsOnboardingStepDocument,
  );

  return useCallback(
    async (universalIdentifiers: string[]) => {
      await completeInstallAppsOnboardingStep({
        variables: { universalIdentifiers },
      });
      setNextOnboardingStatus();
    },
    [completeInstallAppsOnboardingStep, setNextOnboardingStatus],
  );
};
