export type UserAllowanceFirstConsumeResult =
  | {
      outcome: 'applied';
      userShare: number;
      userAllowanceConsumed: number;
      workspaceAllowanceConsumed: number | null;
      isWorkspaceAllowanceUnmetered: boolean;
    }
  | { outcome: 'userAllowanceUnavailable' }
  | { outcome: 'unknown' };
