import { getGettingStartedTrialCountdown } from '@/getting-started/utils/getGettingStartedTrialCountdown';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

const NOW = new Date('2026-03-01T12:00:00.000Z');

describe('getGettingStartedTrialCountdown', () => {
  it.each([
    {
      description: 'returns no trial when the workspace is not trialing',
      subscriptionStatus: SubscriptionStatus.Active,
      currentPeriodEnd: '2026-03-11T12:00:00.000Z',
      hasPaymentMethod: false,
      expected: {
        trialEnd: null,
        isCountdownVisible: false,
        daysLeft: 0,
      },
    },
    {
      description: 'counts the days left until the trial ends',
      subscriptionStatus: SubscriptionStatus.Trialing,
      currentPeriodEnd: '2026-03-11T12:00:00.000Z',
      hasPaymentMethod: false,
      expected: {
        trialEnd: new Date('2026-03-11T12:00:00.000Z'),
        isCountdownVisible: true,
        daysLeft: 10,
      },
    },
    {
      description:
        'hides the countdown with a payment method and never goes below zero days',
      subscriptionStatus: SubscriptionStatus.Trialing,
      currentPeriodEnd: '2026-02-27T12:00:00.000Z',
      hasPaymentMethod: true,
      expected: {
        trialEnd: new Date('2026-02-27T12:00:00.000Z'),
        isCountdownVisible: false,
        daysLeft: 0,
      },
    },
  ])(
    '$description',
    ({ subscriptionStatus, currentPeriodEnd, hasPaymentMethod, expected }) => {
      expect(
        getGettingStartedTrialCountdown({
          subscriptionStatus,
          currentPeriodEnd,
          hasPaymentMethod,
          now: NOW,
        }),
      ).toEqual(expected);
    },
  );
});
