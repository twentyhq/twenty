export type AgentRunnerOutcome =
  | { status: 'COMPLETED'; result: object }
  // paused on an answer or a wait; the engine continues the run and calls its caller back
  | { status: 'SUSPENDED' }
  | { status: 'FAILED'; error: string };
