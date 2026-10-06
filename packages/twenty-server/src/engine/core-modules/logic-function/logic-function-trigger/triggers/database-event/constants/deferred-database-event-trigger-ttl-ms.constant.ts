// A deferral whose signal never clears, because the workspace was deleted or
// the function removed, must not sit in Redis forever.
export const DEFERRED_DATABASE_EVENT_TRIGGER_TTL_MS = 7 * 24 * 60 * 60 * 1000;
