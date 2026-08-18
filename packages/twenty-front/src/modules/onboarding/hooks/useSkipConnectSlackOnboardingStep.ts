import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { SkipConnectSlackOnboardingStepDocument } from '~/generated-metadata/graphql';

export const useSkipConnectSlackOnboardingStep = () => {
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const [skipConnectSlackOnboardingStepMutation] = useMutation(
    SkipConnectSlackOnboardingStepDocument,
  );

  return useCallback(
    async ({ isAutoSkipped }: { isAutoSkipped: boolean }) => {
      await skipConnectSlackOnboardingStepMutation({
        variables: { isAutoSkipped },
      });
      setNextOnboardingStatus({
        stepHistoryEffect: isAutoSkipped
          ? 'leaveUnchanged'
          : 'recordAsReversible',
      });
    },
    [skipConnectSlackOnboardingStepMutation, setNextOnboardingStatus],
  );
};
