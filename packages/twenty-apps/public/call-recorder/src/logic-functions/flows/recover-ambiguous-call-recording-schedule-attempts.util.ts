import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { attachRecoveredRecallBotToCallRecording } from 'src/logic-functions/data/attach-recovered-recall-bot-to-call-recording.util';
import { resetCallRecordingBotScheduleAttempt } from 'src/logic-functions/data/reset-call-recording-bot-schedule-attempt.util';
import { hasUnchangedBotScheduleIdempotencyKey } from 'src/logic-functions/domain/has-unchanged-bot-schedule-idempotency-key.util';
import { scheduleRecallBotForCallRecording } from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';
import { type RecallScheduledBot } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { removeRecallBotOrThrow } from 'src/logic-functions/recall-api/remove-recall-bot-or-throw.util';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalize-optional-string.util';

type AmbiguousCallRecordingScheduleAttempt = {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
};

type RecoverAmbiguousCallRecordingScheduleAttemptsResult = {
  attachedCallRecordingIds: string[];
  scheduledCallRecordingIds: string[];
  failedCallRecordingIds: string[];
};

export const recoverAmbiguousCallRecordingScheduleAttempts = async ({
  client,
  ambiguousCallRecordings,
  recallBotsByCallRecordingId,
  workspaceId,
}: {
  client: CoreApiClient;
  ambiguousCallRecordings: AmbiguousCallRecordingScheduleAttempt[];
  recallBotsByCallRecordingId: Map<string, RecallScheduledBot[]>;
  workspaceId: string | undefined;
}): Promise<RecoverAmbiguousCallRecordingScheduleAttemptsResult> => {
  const result: RecoverAmbiguousCallRecordingScheduleAttemptsResult = {
    attachedCallRecordingIds: [],
    scheduledCallRecordingIds: [],
    failedCallRecordingIds: [],
  };

  for (const { callRecording, calendarEvent } of ambiguousCallRecordings) {
    try {
      const existingRecallBots =
        recallBotsByCallRecordingId.get(callRecording.id) ?? [];
      const canRecoverStoredGeneration =
        isUndefined(callRecording.botScheduleIdempotencyKey) ||
        (!isUndefined(workspaceId) &&
          hasUnchangedBotScheduleIdempotencyKey({
            callRecording,
            calendarEvent,
            workspaceId,
          }));
      const storedGenerationExternalBotIds = getUniqueSortedIds(
        existingRecallBots
          .filter(
            (bot) =>
              isUndefined(
                normalizeOptionalString(
                  bot.metadata.twentyBotScheduleIdempotencyKey,
                ),
              ) ||
              bot.metadata.twentyBotScheduleIdempotencyKey ===
                callRecording.botScheduleIdempotencyKey,
          )
          .map((bot) => bot.id),
      );
      const existingExternalBotId = canRecoverStoredGeneration
        ? storedGenerationExternalBotIds[0]
        : undefined;

      if (!isUndefined(existingExternalBotId)) {
        for (const supersededExternalBotId of storedGenerationExternalBotIds.slice(
          1,
        )) {
          await removeRecallBotOrThrow(supersededExternalBotId);
        }

        const didAttachRecoveredBot =
          await attachRecoveredRecallBotToCallRecording(client, {
            callRecordingId: callRecording.id,
            externalBotId: existingExternalBotId,
            expectedBotScheduleAttemptedAt:
              callRecording.botScheduleAttemptedAt,
            expectedBotScheduleIdempotencyKey:
              callRecording.botScheduleIdempotencyKey,
          });

        if (didAttachRecoveredBot) {
          result.attachedCallRecordingIds.push(callRecording.id);
        }
        continue;
      }

      for (const staleExternalBotId of storedGenerationExternalBotIds) {
        await removeRecallBotOrThrow(staleExternalBotId);
      }

      const didResetScheduleAttempt =
        await resetCallRecordingBotScheduleAttempt(client, {
          callRecordingId: callRecording.id,
          expectedBotScheduleAttemptedAt: callRecording.botScheduleAttemptedAt,
          expectedBotScheduleIdempotencyKey:
            callRecording.botScheduleIdempotencyKey,
        });

      if (!didResetScheduleAttempt) {
        continue;
      }

      const didScheduleRecallBot = await scheduleRecallBotForCallRecording(
        client,
        { callRecording, calendarEvent },
      );

      if (didScheduleRecallBot) {
        result.scheduledCallRecordingIds.push(callRecording.id);
      }
    } catch (error) {
      console.warn(
        `[call-recorder] failed to schedule Recall bot for callRecording ${callRecording.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      result.failedCallRecordingIds.push(callRecording.id);
    }
  }

  return result;
};
