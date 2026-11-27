import { type EnqueueJobsInput } from 'twenty-sdk/logic-function';

// One job is one page of messages, so this caps the Unipile and ingestion calls of history imports
export const LINKEDIN_HISTORY_IMPORT_MESSAGES_JOB_LIMITER: NonNullable<
  EnqueueJobsInput['limiter']
> = { max: 30, durationMs: 60 * 1000 };
