// who started a run and waits on its outcome; stored with a suspended run, so the engine
// can call it back without knowing what the ref means
export type AgentRunCaller = {
  type: 'WORKFLOW_STEP';
  ref: { workflowRunId: string; stepId: string };
};
