import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { SkipSyncEmailOnboardingStepDocument } from '~/generated-metadata/graphql';

export const useSkipSyncEmailOnboardingStep = () => {
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const [skipSyncEmailOnboardingStepMutation] = useMutation(
    SkipSyncEmailOnboardingStepDocument,
  );

  return useCallback(
    async ({ isAutoSkipped }: { isAutoSkipped: boolean }) => {
      await skipSyncEmailOnboardingStepMutation({
        variables: { isAutoSkipped },
      });
      setNextOnboardingStatus({
        stepHistoryEffect: isAutoSkipped
          ? 'leaveUnchanged'
          : 'recordAsReversible',
      });
    },
    [skipSyncEmailOnboardingStepMutation, setNextOnboardingStatus],
  );
};
