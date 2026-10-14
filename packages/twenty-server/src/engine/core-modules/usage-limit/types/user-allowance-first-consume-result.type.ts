export type UserAllowanceFirstConsumeResult =
  | {
      outcome: 'applied';
      userShare: number;
      userAllowanceConsumedValues: number[];
      workspaceAllowanceConsumed: number | null;
      isWorkspaceAllowanceUnmetered: boolean;
    }
  | { outcome: 'userAllowanceUnavailable' }
  | { outcome: 'unknown' };
