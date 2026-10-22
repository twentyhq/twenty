/* @license Enterprise */

import { transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-schedule-event-to-database-subscription-phase.util';

const TRIAL_START = 1_700_000_000;
const TRIAL_END = 1_700_604_800;
const DOWNGRADE_END = 1_703_283_200;

const trialPhase = { start_date: TRIAL_START, end_date: TRIAL_END, items: [] };
const downgradePhase = {
  start_date: TRIAL_END,
  end_date: DOWNGRADE_END,
  items: [],
};

describe('transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase', () => {
  it('keeps the phase Stripe reports as current first, followed by the next one', () => {
    expect(
      transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase({
        current_phase: { start_date: TRIAL_START, end_date: TRIAL_END },
        phases: [trialPhase, downgradePhase],
      }),
    ).toEqual([trialPhase, downgradePhase]);
  });

  it('drops the phases that ended before the current one', () => {
    expect(
      transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase({
        current_phase: { start_date: TRIAL_END, end_date: DOWNGRADE_END },
        phases: [trialPhase, downgradePhase],
      }),
    ).toEqual([downgradePhase]);
  });
});
