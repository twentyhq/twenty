export type SlackRosterMatchCandidate = {
  slackUserId: string;
  workspaceMemberId: string;
  displayName: string | undefined;
};

export type SlackRosterMatchPlan = {
  candidates: SlackRosterMatchCandidate[];
  alreadyLinkedCount: number;
  unmatchedCount: number;
};

export type SlackRosterMatchSummary = {
  linkedCount: number;
  alreadyLinkedCount: number;
  unmatchedCount: number;
  ambiguousEmailCount: number;
  failedCount: number;
  isRosterTruncated: boolean;
};

export type SlackRosterMatchResult =
  | ({ success: true; message: string } & SlackRosterMatchSummary)
  | { success: false; message: string; error: string };
