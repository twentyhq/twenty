import { isUndefined } from '@sniptt/guards';

import { type CallRecordingBotScheduleAttempt } from 'src/logic-functions/domain/call-recording-bot-schedule-attempt';

export const getCallRecordingBotScheduleAttemptMutationFields = (
  attempt: CallRecordingBotScheduleAttempt | undefined,
) => ({
  filter: {
    botScheduleAttemptId: isUndefined(attempt?.id)
      ? { is: 'NULL' }
      : { eq: attempt.id },
    botScheduleAttemptedAt: isUndefined(attempt?.attemptedAt)
      ? { is: 'NULL' }
      : { eq: attempt.attemptedAt },
    botScheduleIdempotencyKey: isUndefined(attempt?.idempotencyKey)
      ? { is: 'NULL' }
      : { eq: attempt.idempotencyKey },
  },
  data: {
    botScheduleAttemptId: attempt?.id ?? null,
    botScheduleAttemptedAt: attempt?.attemptedAt ?? null,
    botScheduleIdempotencyKey: attempt?.idempotencyKey ?? null,
  },
});
