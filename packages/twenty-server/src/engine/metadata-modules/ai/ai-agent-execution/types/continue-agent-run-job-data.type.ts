export type ContinueAgentRunJobData = {
  workspaceId: string;
  runId: string;
  // the run's resume count when scheduled, so a duplicate job finds it moved on
  resumeCount: number;
};
