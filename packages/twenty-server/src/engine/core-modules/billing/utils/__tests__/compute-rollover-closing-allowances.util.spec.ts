/* @license Enterprise */

import { computeRolloverClosingAllowances } from 'src/engine/core-modules/billing/utils/compute-rollover-closing-allowances.util';

const planWorkspaceCredits = {
  workspaceCreditsForPackMicro: 10_000_000,
  workspaceCreditsForSeatsMicro: 20_000_000,
};

describe('computeRolloverClosingAllowances', () => {
  it('rolls the credit pack over and spends the seat credits first', () => {
    expect(
      computeRolloverClosingAllowances({
        planWorkspaceCredits,
        trialAllowanceMicro: 2_500_000,
        isFirstPeriodAfterTrial: false,
        workspaceCreditAllowanceMicro: null,
      }),
    ).toEqual({
      closingAllowanceMicro: 10_000_000,
      closingSeatAllowanceMicro: 20_000_000,
    });
  });

  it('carries the trial credits into the first paid period', () => {
    expect(
      computeRolloverClosingAllowances({
        planWorkspaceCredits,
        trialAllowanceMicro: 2_500_000,
        isFirstPeriodAfterTrial: true,
        workspaceCreditAllowanceMicro: null,
      }),
    ).toEqual({
      closingAllowanceMicro: 2_500_000,
      closingSeatAllowanceMicro: 0,
    });
  });

  it('spends a workspace credit allowance first without rolling it over', () => {
    expect(
      computeRolloverClosingAllowances({
        planWorkspaceCredits,
        trialAllowanceMicro: 2_500_000,
        isFirstPeriodAfterTrial: false,
        workspaceCreditAllowanceMicro: 5_000_000,
      }),
    ).toEqual({
      closingAllowanceMicro: 10_000_000,
      closingSeatAllowanceMicro: 5_000_000,
    });
  });

  it('carries nothing from a trial whose credits a workspace credit allowance replaced', () => {
    expect(
      computeRolloverClosingAllowances({
        planWorkspaceCredits,
        trialAllowanceMicro: 2_500_000,
        isFirstPeriodAfterTrial: true,
        workspaceCreditAllowanceMicro: 0,
      }),
    ).toEqual({
      closingAllowanceMicro: 0,
      closingSeatAllowanceMicro: 0,
    });
  });
});
