// covers the Retry-After wait plus whatever the first attempt already spent, so
// one retry cannot add a second full request timeout to a 15s logic function
export const SLACK_RATE_LIMIT_RETRY_BUDGET_MS = 4 * 1000;
