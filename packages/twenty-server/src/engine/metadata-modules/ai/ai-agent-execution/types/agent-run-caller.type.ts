// who started a run and waits on what it pauses on; written on the calls it leaves pending
export type AgentRunCaller = {
  type: 'WORKFLOW_STEP';
  ref: { workflowRunId: string; stepId: string };
};
