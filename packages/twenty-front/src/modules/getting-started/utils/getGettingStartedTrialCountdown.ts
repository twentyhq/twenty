import { differenceInCalendarDays } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import {
  type BillingTrialPeriod,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

export const getGettingStartedTrialCountdown = ({
  subscriptionStatus,
  currentPeriodEnd,
  hasPaymentMethod,
  trialPeriods,
  now,
}: {
  subscriptionStatus: SubscriptionStatus | undefined;
  currentPeriodEnd: string | null | undefined;
  hasPaymentMethod: boolean | null | undefined;
  trialPeriods: Pick<BillingTrialPeriod, 'duration' | 'isCreditCardRequired'>[];
  now: Date;
}): {
  trialEnd: Date | null;
  isCountdownVisible: boolean;
  daysLeft: number;
  trialDays: number;
} => {
  if (
    subscriptionStatus !== SubscriptionStatus.Trialing ||
    !isDefined(currentPeriodEnd)
  ) {
    return {
      trialEnd: null,
      isCountdownVisible: false,
      daysLeft: 0,
      trialDays: 0,
    };
  }

  const trialEnd = new Date(currentPeriodEnd);
  const daysLeft = Math.max(0, differenceInCalendarDays(trialEnd, now));
  const trialDurationInDays =
    trialPeriods.find(({ isCreditCardRequired }) => !isCreditCardRequired)
      ?.duration ?? 0;

  return {
    trialEnd,
    isCountdownVisible: hasPaymentMethod === false,
    daysLeft,
    trialDays: Math.max(trialDurationInDays, daysLeft),
  };
};
