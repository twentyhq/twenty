import { type EnqueueJobsInput } from 'twenty-sdk/logic-function';

// Each job makes one Unipile profile call and up to four Twenty calls
export const LINKEDIN_ENRICH_PERSON_JOB_LIMITER: NonNullable<
  EnqueueJobsInput['limiter']
> = { max: 10, durationMs: 60 * 1000 };
