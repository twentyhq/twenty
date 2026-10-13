import { addMemberCreditsUsedToUsageBreakdown } from 'src/engine/core-modules/usage/utils/add-member-credits-used-to-usage-breakdown.util';

const ITEMS = [
  { key: 'member-1', label: 'Ada Lovelace', creditsUsed: 5_000 },
  { key: 'member-2', label: 'Alan Turing', creditsUsed: 2_000 },
];

describe('addMemberCreditsUsedToUsageBreakdown', () => {
  it('should add each member share by key and keep the totals', () => {
    expect(
      addMemberCreditsUsedToUsageBreakdown({
        items: ITEMS,
        memberCreditsUsedMicroByKey: new Map([
          ['member-1', 3_000],
          ['member-2', 2_000],
        ]),
      }),
    ).toEqual([
      {
        key: 'member-1',
        label: 'Ada Lovelace',
        creditsUsed: 5_000,
        memberCreditsUsed: 3_000,
      },
      {
        key: 'member-2',
        label: 'Alan Turing',
        creditsUsed: 2_000,
        memberCreditsUsed: 2_000,
      },
    ]);
  });

  it('should give 0 to a member the read returned no row for', () => {
    expect(
      addMemberCreditsUsedToUsageBreakdown({
        items: ITEMS,
        memberCreditsUsedMicroByKey: new Map([['member-1', 3_000]]),
      }).map(({ memberCreditsUsed }) => memberCreditsUsed),
    ).toEqual([3_000, 0]);
  });

  it('should set every member share to null when the read failed', () => {
    expect(
      addMemberCreditsUsedToUsageBreakdown({
        items: ITEMS,
        memberCreditsUsedMicroByKey: null,
      }),
    ).toEqual([
      {
        key: 'member-1',
        label: 'Ada Lovelace',
        creditsUsed: 5_000,
        memberCreditsUsed: null,
      },
      {
        key: 'member-2',
        label: 'Alan Turing',
        creditsUsed: 2_000,
        memberCreditsUsed: null,
      },
    ]);
  });
});
