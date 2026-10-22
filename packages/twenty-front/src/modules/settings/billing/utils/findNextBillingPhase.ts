import { type BillingSubscriptionSchedulePhase } from '~/generated-metadata/graphql';

// Stripe keeps a schedule attached after its last transition, so the phase
// after the first one can already be the current phase.
export const findNextBillingPhase = <
  TPhase extends Pick<BillingSubscriptionSchedulePhase, 'start_date'>,
>(
  phases: TPhase[],
  nowInMilliseconds: number,
): TPhase | undefined =>
  phases
    .filter((phase) => phase.start_date * 1000 > nowInMilliseconds)
    .sort((phaseA, phaseB) => phaseA.start_date - phaseB.start_date)[0];
