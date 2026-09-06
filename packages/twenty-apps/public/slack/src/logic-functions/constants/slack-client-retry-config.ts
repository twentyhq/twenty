import { type RetryOptions } from '@slack/web-api';

// @slack/web-api defaults to tenRetriesInAboutThirtyMinutes, far past every
// logic function budget here: one short retry covers a transient 5xx
export const SLACK_CLIENT_RETRY_CONFIG: RetryOptions = {
  retries: 1,
  factor: 1,
  minTimeout: 250,
  maxTimeout: 250,
};
