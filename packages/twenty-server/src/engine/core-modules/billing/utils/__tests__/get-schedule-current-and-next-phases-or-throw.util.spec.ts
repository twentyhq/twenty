/* @license Enterprise */

import { getScheduleCurrentAndNextPhasesOrThrow } from 'src/engine/core-modules/billing/utils/get-schedule-current-and-next-phases-or-throw.util';

const TRIAL_START = 1_700_000_000;
const TRIAL_END = 1_700_604_800;
const DOWNGRADE_END = 1_703_283_200;

const buildPhase = (startDate: number, endDate: number) => ({
  start_date: startDate,
  end_date: endDate,
});

const trialPhase = buildPhase(TRIAL_START, TRIAL_END);
const downgradePhase = buildPhase(TRIAL_END, DOWNGRADE_END);

describe('getScheduleCurrentAndNextPhasesOrThrow', () => {
  it('follows the phase Stripe reports as current, with the later phase as next', () => {
    expect(
      getScheduleCurrentAndNextPhasesOrThrow({
        current_phase: { start_date: TRIAL_START, end_date: TRIAL_END },
        phases: [downgradePhase, trialPhase],
      }),
    ).toEqual({ currentPhase: trialPhase, nextPhase: downgradePhase });
  });

  it('has no next phase once Stripe has moved to the last phase', () => {
    expect(
      getScheduleCurrentAndNextPhasesOrThrow({
        current_phase: { start_date: TRIAL_END, end_date: DOWNGRADE_END },
        phases: [trialPhase, downgradePhase],
      }),
    ).toEqual({ currentPhase: downgradePhase, nextPhase: undefined });
  });

  it('throws when Stripe reports no current phase', () => {
    expect(() =>
      getScheduleCurrentAndNextPhasesOrThrow({
        current_phase: null,
        phases: [trialPhase, downgradePhase],
      }),
    ).toThrow('Subscription must have at least 1 current phase');
  });
});
