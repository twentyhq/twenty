// The shim never waits for real idleness, so it advertises far less headroom
// than the native 50 ms: work chunkers would otherwise block the worker thread
// that also services rendering and host RPC.
export const IDLE_CALLBACK_TIME_BUDGET_MS = 5;
