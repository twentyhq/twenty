import { type RetryOptions } from '@slack/web-api';

// @slack/web-api defaults to tenRetriesInAboutThirtyMinutes, which outlives
// every logic function budget in this app: one short retry covers a transient
// 5xx, anything longer has to fail so the caller can degrade
export const SLACK_CLIENT_RETRY_CONFIG: RetryOptions = {
  retries: 1,
  factor: 1,
  minTimeout: 250,
  maxTimeout: 250,
};
