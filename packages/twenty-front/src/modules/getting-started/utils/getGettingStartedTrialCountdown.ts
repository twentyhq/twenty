import { differenceInCalendarDays } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { SubscriptionStatus } from '~/generated-metadata/graphql';

export const getGettingStartedTrialCountdown = ({
  subscriptionStatus,
  currentPeriodEnd,
  hasPaymentMethod,
  now,
}: {
  subscriptionStatus: SubscriptionStatus | undefined;
  currentPeriodEnd: string | null | undefined;
  hasPaymentMethod: boolean | null | undefined;
  now: Date;
}): {
  trialEnd: Date | null;
  isCountdownVisible: boolean;
  daysLeft: number;
} => {
  if (
    subscriptionStatus !== SubscriptionStatus.Trialing ||
    !isDefined(currentPeriodEnd)
  ) {
    return {
      trialEnd: null,
      isCountdownVisible: false,
      daysLeft: 0,
    };
  }

  const trialEnd = new Date(currentPeriodEnd);

  return {
    trialEnd,
    isCountdownVisible: hasPaymentMethod === false,
    daysLeft: Math.max(0, differenceInCalendarDays(trialEnd, now)),
  };
};
