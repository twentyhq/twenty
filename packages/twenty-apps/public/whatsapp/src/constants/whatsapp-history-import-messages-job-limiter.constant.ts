import { type EnqueueJobsInput } from 'twenty-sdk/logic-function';

export const WHATSAPP_HISTORY_IMPORT_MESSAGES_JOB_LIMITER: NonNullable<
  EnqueueJobsInput['limiter']
> = { max: 30, durationMs: 60 * 1000 };
