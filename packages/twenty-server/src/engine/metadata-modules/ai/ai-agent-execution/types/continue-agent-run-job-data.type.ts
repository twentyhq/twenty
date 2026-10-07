export type ContinueAgentRunJobData = {
  workspaceId: string;
  suspensionId: string;
  // the suspension's resume count when scheduled, so a duplicate job finds it moved on
  resumeCount: number;
};
