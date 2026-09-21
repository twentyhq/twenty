import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { getInstallAppsStepHistoryEffect } from '@/onboarding/utils/getInstallAppsStepHistoryEffect';
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
        stepHistoryEffect: getInstallAppsStepHistoryEffect({
          universalIdentifiers,
          isAutoSkipped,
        }),
      });
    },
    [triggerInstallAppsOnboardingStep, setNextOnboardingStatus],
  );
};
