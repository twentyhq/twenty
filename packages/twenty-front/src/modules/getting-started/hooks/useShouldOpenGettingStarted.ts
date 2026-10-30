import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { getShouldOpenGettingStarted } from '@/getting-started/utils/getShouldOpenGettingStarted';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { isDefined } from 'twenty-shared/utils';

import { SubscriptionStatus } from '~/generated-metadata/graphql';

export const useShouldOpenGettingStarted = ({
  isEnabled,
}: {
  isEnabled: boolean;
}) => {
  const subscriptionStatus = useSubscriptionStatus();

  const { progress, loading } = useGettingStartedProgress({
    isEnabled: isEnabled && subscriptionStatus === SubscriptionStatus.Trialing,
  });

  if (!isDefined(progress)) {
    return { shouldOpenGettingStarted: false, isLoading: loading };
  }

  return {
    shouldOpenGettingStarted: getShouldOpenGettingStarted({
      progress,
      now: new Date(),
    }),
    isLoading: false,
  };
};
