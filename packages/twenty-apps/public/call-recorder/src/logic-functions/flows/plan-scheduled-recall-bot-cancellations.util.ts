import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { findCanceledCallRecordingsWithBot } from 'src/logic-functions/data/find-canceled-call-recordings-with-bot.util';
import { planScheduledRecallBotCancellationMinuteSlots } from 'src/logic-functions/domain/plan-scheduled-recall-bot-cancellation-minute-slots.util';
import { type PlanScheduledRecallBotCancellationsResult } from 'src/logic-functions/flows/plan-scheduled-recall-bot-cancellations-result.type';
import { type ScheduledRecallBotCancellation } from 'src/logic-functions/types/scheduled-recall-bot-cancellation.type';

export const planScheduledRecallBotCancellations = async ({
  client,
  now,
}: {
  client: Pick<CoreApiClient, 'query'>;
  now: Date;
}): Promise<PlanScheduledRecallBotCancellationsResult> => {
  const canceledCallRecordingBots =
    await findCanceledCallRecordingsWithBot(client);
  const { minuteSlots, unplannedCallRecordingCount } =
    planScheduledRecallBotCancellationMinuteSlots({
      canceledCallRecordingBots,
      now,
    });

  if (unplannedCallRecordingCount > 0) {
    console.warn(
      `[call-recorder] scheduled Recall bot cancellation left ${unplannedCallRecordingCount} of ${canceledCallRecordingBots.length} bots to their follow-ups`,
    );
  }

  return {
    canceledCallRecordingCount: canceledCallRecordingBots.length,
    unplannedCallRecordingCount,
    plannedSlotCount: minuteSlots.length,
    enqueuedSlotCount: await enqueueMinuteSlots(minuteSlots),
  };
};

const enqueueMinuteSlots = async (
  minuteSlots: ScheduledRecallBotCancellation[][],
): Promise<number> => {
  for (const [
    slotIndex,
    scheduledRecallBotCancellations,
  ] of minuteSlots.entries()) {
    try {
      await enqueueLogicFunctionJobs({
        logicFunctionUniversalIdentifier:
          CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads: [{ scheduledRecallBotCancellations }],
        delayMs: slotIndex * MILLISECONDS_PER_MINUTE,
      });
    } catch (error) {
      if (slotIndex === 0) {
        throw error;
      }

      console.warn(
        `[call-recorder] scheduled Recall bot cancellation enqueued ${slotIndex} of ${minuteSlots.length} slots; their follow-ups cancel the rest: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return slotIndex;
    }
  }

  return minuteSlots.length;
};
