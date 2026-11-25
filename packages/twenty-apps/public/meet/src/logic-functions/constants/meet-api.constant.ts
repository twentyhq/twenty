export const MEET_API_BASE_URL = 'https://meet.googleapis.com/v2';
export const MEET_REQUEST_MAX_ATTEMPTS = 4;
export const MEET_REQUEST_RETRY_BASE_DELAY_MILLISECONDS = 1_000;
export const MEET_REQUEST_RETRY_BUDGET_MILLISECONDS = 8_000;
export const MEET_RETRYABLE_STATUSES = new Set([
  429, 500, 502, 503, 504,
]);
export const MEET_LIST_PAGE_SIZE = 100;
export const MAX_MEET_LIST_PAGES = 50;
