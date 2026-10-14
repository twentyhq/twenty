export type UserAllowanceFirstConsumeResult =
  | {
      outcome: 'applied';
      userShare: number;
      userAllowanceConsumed: number;
      workspaceAllowanceConsumed: number | null;
      isWorkspaceAllowanceUnmetered: boolean;
    }
  // Certain that nothing was applied to the user allowance counter
  | { outcome: 'userAllowanceUnavailable' }
  // The script threw, so whether it ran is unknown
  | { outcome: 'unknown' };
