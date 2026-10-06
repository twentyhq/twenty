// A producer that dies without clearing its signal must not hold triggers
// forever: producers refresh the signal on every stage change, and a signal
// that is not refreshed within this window expires on its own.
export const WORKSPACE_SIGNAL_DEFAULT_TTL_MS = 30 * 60 * 1000;
