import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
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

  const remainingSteps = getGettingStartedRemainingSteps({
    steps: progress.steps,
    completedSteps: progress.completedSteps,
    permissionFlagMap,
  });

  return {
    shouldOpenGettingStarted:
      !progress.isHidden &&
      remainingSteps.length > 0 &&
      (!isDefined(progress.snoozedUntil) ||
        Date.parse(progress.snoozedUntil) <= Date.now()),
    isLoading: false,
  };
};
