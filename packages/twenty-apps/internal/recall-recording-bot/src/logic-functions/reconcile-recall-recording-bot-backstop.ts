import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { BACKSTOP_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/backstop-reconciliation-logic-function-universal-identifier';
import { RECALL_RECORDING_BOT_BACKSTOP_CRON_PATTERN } from 'src/logic-functions/constants/recall-recording-bot-backstop-cron-pattern';
import { shouldRunRecallRecordingBotBackstopAt } from 'src/logic-functions/constants/should-run-recall-recording-bot-backstop-at';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { fetchAllNodes } from 'src/logic-functions/utils/fetch-all-nodes.util';
import { getRecallRecordingBotBackstopIntervalMinutes } from 'src/logic-functions/utils/get-recall-recording-bot-backstop-interval-minutes.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { reconcileRecallRecordingBotForCalendarEventIds } from 'src/logic-functions/utils/reconcile-recall-recording-bot.util';

const BACKSTOP_LOOKBACK_HOURS = 4;
const BACKSTOP_LOOKAHEAD_HOURS = 24;

const handler = async (): Promise<object> => {
  const now = new Date();
  const intervalMinutes = getRecallRecordingBotBackstopIntervalMinutes();

  if (
    !shouldRunRecallRecordingBotBackstopAt({
      now,
      intervalMinutes,
    })
  ) {
    return {
      skipped: true,
      reason: 'interval gate',
      intervalMinutes,
    };
  }

  const client = new CoreApiClient();
  const calendarEventIds = await fetchUpcomingCalendarEventIds(client, now);
  const reconciliationResults =
    await reconcileRecallRecordingBotForCalendarEventIds({
      client,
      calendarEventIds,
      now,
    });

  return {
    reconciled: true,
    intervalMinutes,
    scannedCalendarEventCount: calendarEventIds.length,
    reconciliationResults,
  };
};

const fetchUpcomingCalendarEventIds = async (
  client: CoreApiClient,
  now: Date,
): Promise<string[]> => {
  const lowerBound = new Date(
    now.getTime() - BACKSTOP_LOOKBACK_HOURS * 60 * 60 * 1000,
  ).toISOString();
  const upperBound = new Date(
    now.getTime() + BACKSTOP_LOOKAHEAD_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const filter: Record<string, unknown> = {
    startsAt: {
      gte: lowerBound,
      lte: upperBound,
    },
  };
  const calendarEventNodes = await fetchAllNodes(async (afterCursor) => {
    const queryResult = await client.query({
      calendarEvents: {
        __args: {
          filter,
          first: TWENTY_PAGE_SIZE,
          ...(afterCursor === undefined ? {} : { after: afterCursor }),
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
        edges: {
          node: {
            id: true,
          },
        },
      },
    });

    return queryResult.calendarEvents;
  });

  return getUniqueSortedIds(
    calendarEventNodes.map((calendarEvent) => calendarEvent.id),
  );
};

export default defineLogicFunction({
  universalIdentifier:
    BACKSTOP_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-recall-recording-bot-backstop',
  description:
    'Periodically reconciles upcoming calendar events as a backstop for missed event triggers.',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: RECALL_RECORDING_BOT_BACKSTOP_CRON_PATTERN,
  },
});
