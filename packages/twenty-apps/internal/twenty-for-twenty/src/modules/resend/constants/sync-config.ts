export const RESEND_PAGE_SIZE = 100;

export const TWENTY_PAGE_SIZE = 100;

export const RATE_LIMIT_MAX_RETRIES = 5;

export const RATE_LIMIT_BASE_DELAY_MS = 1000;

export const RATE_LIMIT_MIN_INTERVAL_MS = 220;

export const SYNC_LOOKUP_PROGRESS = 0.1;

export const INITIAL_SYNC_MODE_ENV_VAR_NAME = 'INITIAL_SYNC_MODE';

export const INTERMEDIATE_SYNC_EMAILS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const RESEND_SYNC_CRON_PATTERNS = {
  EMAILS: '0-59/5 * * * *',
  CONTACTS: '1-59/5 * * * *',
  BROADCASTS: '2-59/5 * * * *',
  TEMPLATES: '3-59/5 * * * *',
} as const;

export const RESEND_SYNC_SLOT_TIMEOUT_SECONDS = {
  EMAILS: 55,
  CONTACTS: 55,
  BROADCASTS: 55,
  TEMPLATES: 115,
} as const;

export const RESEND_SYNC_SLOT_DEADLINE_SLACK_MS = 5_000;
