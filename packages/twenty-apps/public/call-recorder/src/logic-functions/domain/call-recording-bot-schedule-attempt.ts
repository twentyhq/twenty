import { isUndefined } from '@sniptt/guards';

import { normalizeOptionalString } from 'src/logic-functions/utils/normalize-optional-string.util';

export type CallRecordingBotScheduleAttempt = {
  id?: string;
  attemptedAt?: string;
  idempotencyKey?: string;
};

export type CompleteCallRecordingBotScheduleAttempt = Required<
  CallRecordingBotScheduleAttempt
>;

type PersistedCallRecordingBotScheduleAttempt = {
  botScheduleAttemptId?: string | null;
  botScheduleAttemptedAt?: string | null;
  botScheduleIdempotencyKey?: string | null;
};

export const getCallRecordingBotScheduleAttempt = (
  persistedAttempt: PersistedCallRecordingBotScheduleAttempt,
): CallRecordingBotScheduleAttempt | undefined => {
  const attempt = {
    id: normalizeOptionalString(persistedAttempt.botScheduleAttemptId),
    attemptedAt: normalizeOptionalString(
      persistedAttempt.botScheduleAttemptedAt,
    ),
    idempotencyKey: normalizeOptionalString(
      persistedAttempt.botScheduleIdempotencyKey,
    ),
  };

  return isUndefined(attempt.id) &&
    isUndefined(attempt.attemptedAt) &&
    isUndefined(attempt.idempotencyKey)
    ? undefined
    : attempt;
};

export const isCompleteCallRecordingBotScheduleAttempt = (
  attempt: CallRecordingBotScheduleAttempt | undefined,
): attempt is CompleteCallRecordingBotScheduleAttempt =>
  !isUndefined(attempt?.id) &&
  !isUndefined(attempt.attemptedAt) &&
  !isUndefined(attempt.idempotencyKey);
