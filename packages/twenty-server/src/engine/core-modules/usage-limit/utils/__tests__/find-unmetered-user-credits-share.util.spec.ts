import { findUnmeteredUserCreditsShare } from 'src/engine/core-modules/usage-limit/utils/find-unmetered-user-credits-share.util';

describe('findUnmeteredUserCreditsShare', () => {
  it('charges the user the smallest amount across their windows', () => {
    expect(
      findUnmeteredUserCreditsShare([
        { amount: 600, split: { kind: 'userCredits', limitValue: 1_000 } },
        { amount: 400, split: { kind: 'userCredits', limitValue: 5_000 } },
        { amount: 600, split: { kind: 'workspaceCredits' } },
      ]),
    ).toBe(400);
  });

  it('charges the user nothing when no user window applies', () => {
    expect(
      findUnmeteredUserCreditsShare([
        { amount: 600, split: { kind: 'workspaceCredits' } },
        { amount: 600, split: null },
      ]),
    ).toBe(0);
  });
});
