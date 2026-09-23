/* @license Enterprise */

// A reload that failed left the previous token in place, which the worker may
// have already replaced, so it is retried far sooner than a successful one is
// reloaded. Still an interval rather than an immediate retry: a database that
// stays down would otherwise put a read on the path of every license check.
export const ENTERPRISE_VALIDITY_TOKEN_RELOAD_RETRY_INTERVAL_MS = 60 * 1000;
