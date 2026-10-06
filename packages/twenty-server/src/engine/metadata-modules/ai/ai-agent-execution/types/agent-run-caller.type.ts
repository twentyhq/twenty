// who started a run and waits on what it pauses on; written on the calls it leaves pending
export type AgentRunCaller = {
  type: 'WORKFLOW_STEP';
  ref: { workflowRunId: string; stepId: string };
};

// matches every caller whose ref holds these values, such as every step of one run
export type AgentRunCallerFilter = {
  type: AgentRunCaller['type'];
  ref: Partial<AgentRunCaller['ref']>;
};
