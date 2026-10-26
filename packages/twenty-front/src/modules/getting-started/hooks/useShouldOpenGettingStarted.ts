import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
import { shouldOpenGettingStarted } from '@/getting-started/utils/shouldOpenGettingStarted';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { isDefined } from 'twenty-shared/utils';

import { SubscriptionStatus } from '~/generated-metadata/graphql';

export const useShouldOpenGettingStarted = ({
  isEnabled,
}: {
  isEnabled: boolean;
}) => {
  const subscriptionStatus = useSubscriptionStatus();
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);

  const { progress, loading } = useGettingStartedProgress({
    isEnabled: isEnabled && subscriptionStatus === SubscriptionStatus.Trialing,
  });

  if (!isDefined(progress)) {
    return { shouldOpenGettingStarted: false, isLoading: loading };
  }

  return {
    shouldOpenGettingStarted: shouldOpenGettingStarted({
      remainingSteps: getGettingStartedRemainingSteps({
        steps: progress.steps,
        completedSteps: progress.completedSteps,
        permissionFlagMap,
      }),
      snoozedUntil: progress.snoozedUntil,
      now: new Date(),
    }),
    isLoading: false,
  };
};
