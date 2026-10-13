export type MemberFirstConsumeResult =
  | {
      outcome: 'applied';
      memberShare: number;
      memberConsumed: number;
      allowanceConsumed: number | null;
      isAllowanceUnmetered: boolean;
    }
  // Certain that nothing was applied to the member counter
  | { outcome: 'memberUnavailable' }
  // The script threw, so whether it ran is unknown
  | { outcome: 'unknown' };
