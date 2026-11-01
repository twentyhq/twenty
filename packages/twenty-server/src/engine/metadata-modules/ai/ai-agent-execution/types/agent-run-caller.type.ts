// who started a run and waits on its outcome; stored with a suspended run, so the engine can call
// back the handler registered for its type, which alone knows what the ref means
export type AgentRunCaller = {
  type: string;
  ref: Record<string, unknown>;
};
