import { type EnqueueJobsInput } from 'twenty-sdk/logic-function';

export const LINKEDIN_HISTORY_IMPORT_CONTACTS_JOB_LIMITER: NonNullable<
  EnqueueJobsInput['limiter']
> = { max: 60, durationMs: 60 * 1000 };
