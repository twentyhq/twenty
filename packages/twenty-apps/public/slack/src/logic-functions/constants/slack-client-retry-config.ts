import { type RetryOptions } from '@slack/web-api';

// the library default retries for thirty minutes, past every budget here
export const SLACK_CLIENT_RETRY_CONFIG: RetryOptions = {
  retries: 1,
  factor: 1,
  minTimeout: 250,
  maxTimeout: 250,
};
