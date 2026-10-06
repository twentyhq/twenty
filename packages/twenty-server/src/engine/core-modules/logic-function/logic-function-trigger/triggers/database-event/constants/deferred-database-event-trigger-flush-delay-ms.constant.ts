// A sync reports itself complete when its last batch is saved, while contact
// creation and participant matching keep writing for a few minutes after.
// The catch-up waits for that tail before it runs.
export const DEFERRED_DATABASE_EVENT_TRIGGER_FLUSH_DELAY_MS = 3 * 60 * 1000;
