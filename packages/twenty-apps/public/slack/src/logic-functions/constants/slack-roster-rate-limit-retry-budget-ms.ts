// users.list is 20/min, and the roster match has 120s, so waiting one
// Retry-After out beats failing the whole run
export const SLACK_ROSTER_RATE_LIMIT_RETRY_BUDGET_MS = 60 * 1000;
