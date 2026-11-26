import { isArray, isUndefined } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';

import { CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type ScheduledRecallBotCancellation } from 'src/logic-functions/types/scheduled-recall-bot-cancellation.type';
import {
  cancelScheduledRecallBots,
  type CancelScheduledRecallBotsResult,
} from 'src/logic-functions/flows/cancel-scheduled-recall-bots.util';
import { type PlanScheduledRecallBotCancellationsResult } from 'src/logic-functions/flows/plan-scheduled-recall-bot-cancellations-result.type';
import { planScheduledRecallBotCancellations } from 'src/logic-functions/flows/plan-scheduled-recall-bot-cancellations.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { createCoreApiClientRunningAsApplication } from 'src/logic-functions/utils/create-core-api-client-running-as-application.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const cancelScheduledRecallBotsHandler = async (
  payload: unknown,
): Promise<
  CancelScheduledRecallBotsResult | PlanScheduledRecallBotCancellationsResult
> => {
  const client = createCoreApiClientRunningAsApplication();
  const scheduledRecallBotCancellations =
    asRecord(payload)?.scheduledRecallBotCancellations;

  if (isArray(scheduledRecallBotCancellations)) {
    const parsedScheduledRecallBotCancellations =
      parseScheduledRecallBotCancellations(scheduledRecallBotCancellations);
    const malformedCancellationCount =
      scheduledRecallBotCancellations.length -
      parsedScheduledRecallBotCancellations.length;

    if (malformedCancellationCount > 0) {
      console.warn(
        `[call-recorder] scheduled Recall bot cancellation ignored ${malformedCancellationCount} of ${scheduledRecallBotCancellations.length} entries without a call recording id or bot id`,
      );
    }

    return cancelScheduledRecallBots({
      client,
      scheduledRecallBotCancellations: parsedScheduledRecallBotCancellations,
    });
  }

  try {
    return await planScheduledRecallBotCancellations({
      client,
      now: new Date(),
    });
  } catch (error) {
    throw buildRetryableStepFailure(
      'scheduled Recall bot cancellation planning',
      error,
    );
  }
};

const parseScheduledRecallBotCancellations = (
  scheduledRecallBotCancellations: unknown[],
): ScheduledRecallBotCancellation[] =>
  scheduledRecallBotCancellations.flatMap((scheduledRecallBotCancellation) => {
    const record = asRecord(scheduledRecallBotCancellation);
    const callRecordingId = getString(record?.callRecordingId);
    const externalBotId = getString(record?.externalBotId);

    if (isUndefined(callRecordingId) || isUndefined(externalBotId)) {
      return [];
    }

    return [{ callRecordingId, externalBotId }];
  });

export default defineLogicFunction({
  universalIdentifier:
    CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cancel-scheduled-recall-bots',
  description:
    'Cancels the Recall bots of canceled recording requests, soonest meeting first, paced per minute.',
  timeoutSeconds: 900,
  handler: cancelScheduledRecallBotsHandler,
});
