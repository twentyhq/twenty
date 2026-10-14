import { addUserCreditsUsedToUsageBreakdown } from 'src/engine/core-modules/usage/utils/add-user-credits-used-to-usage-breakdown.util';

const ITEMS = [
  { key: 'member-1', label: 'Ada Lovelace', creditsUsed: 5_000 },
  { key: 'member-2', label: 'Alan Turing', creditsUsed: 2_000 },
];

describe('addUserCreditsUsedToUsageBreakdown', () => {
  it('should add each user share by key and keep the totals', () => {
    expect(
      addUserCreditsUsedToUsageBreakdown({
        items: ITEMS,
        userCreditsUsedMicroByKey: new Map([
          ['member-1', 3_000],
          ['member-2', 2_000],
        ]),
      }),
    ).toEqual([
      {
        key: 'member-1',
        label: 'Ada Lovelace',
        creditsUsed: 5_000,
        userCreditsUsed: 3_000,
      },
      {
        key: 'member-2',
        label: 'Alan Turing',
        creditsUsed: 2_000,
        userCreditsUsed: 2_000,
      },
    ]);
  });

  it('should give 0 to a member the read returned no row for', () => {
    expect(
      addUserCreditsUsedToUsageBreakdown({
        items: ITEMS,
        userCreditsUsedMicroByKey: new Map([['member-1', 3_000]]),
      }).map(({ userCreditsUsed }) => userCreditsUsed),
    ).toEqual([3_000, 0]);
  });

  it('should set every user share to null when the read failed', () => {
    expect(
      addUserCreditsUsedToUsageBreakdown({
        items: ITEMS,
        userCreditsUsedMicroByKey: null,
      }),
    ).toEqual([
      {
        key: 'member-1',
        label: 'Ada Lovelace',
        creditsUsed: 5_000,
        userCreditsUsed: null,
      },
      {
        key: 'member-2',
        label: 'Alan Turing',
        creditsUsed: 2_000,
        userCreditsUsed: null,
      },
    ]);
  });
});
