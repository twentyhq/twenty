export type SlackRosterMatchResult =
  | {
      success: true;
      message: string;
      linkedCount: number;
      alreadyLinkedCount: number;
      unmatchedCount: number;
    }
  | { success: false; message: string; error: string };
