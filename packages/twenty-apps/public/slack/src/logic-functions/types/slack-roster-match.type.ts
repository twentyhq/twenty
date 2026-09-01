export type SlackRosterMatchResult =
  | {
      success: true;
      message: string;
      linkedCount: number;
      alreadyLinkedCount: number;
      unmatchedCount: number;
      failedCount: number;
      isRosterTruncated: boolean;
    }
  | { success: false; message: string; error: string };
