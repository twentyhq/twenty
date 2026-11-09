export type HttpEgressRejection = {
  reason:
    | 'suspended'
    | 'concurrency'
    | 'test-user-rate'
    | 'test-workspace-rate'
    | 'agent-user-rate'
    | 'workspace-rate'
    | 'trial-workspace-rate';
  retryAfterMs?: number;
};
