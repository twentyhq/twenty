// WAITING: the caller takes the outcome now; NOT_READY: it is still recording that it waits;
// GONE: it stopped waiting, such as a workflow run that ended
export type AgentRunCallerWaitingState = 'WAITING' | 'NOT_READY' | 'GONE';
