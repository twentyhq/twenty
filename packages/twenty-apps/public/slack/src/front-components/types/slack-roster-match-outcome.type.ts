export type SlackRosterMatchOutcome = {
  success: boolean;
  message: string;
  error?: string;
  linkedCount: number;
  unmatchedCount: number;
  failedCount: number;
};
