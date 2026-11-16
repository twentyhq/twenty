export type TeamsDirectoryMatchCandidate = {
  teamsUserAadObjectId: string;
  workspaceMemberId: string;
  displayName: string | undefined;
};

export type TeamsDirectoryMatchPlan = {
  candidates: TeamsDirectoryMatchCandidate[];
  alreadyLinkedCount: number;
  unmatchedCount: number;
};

export type TeamsDirectoryMatchSummary = {
  linkedCount: number;
  alreadyLinkedCount: number;
  unmatchedCount: number;
  ambiguousEmailCount: number;
  failedCount: number;
  isDirectoryTruncated: boolean;
};

export type TeamsDirectoryMatchResult =
  | ({ success: true; message: string } & TeamsDirectoryMatchSummary)
  | { success: false; message: string; error: string };
