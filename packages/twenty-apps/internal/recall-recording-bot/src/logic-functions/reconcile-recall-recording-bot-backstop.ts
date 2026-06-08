import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { BACKSTOP_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/backstop-reconciliation-logic-function-universal-identifier';
import { RECALL_RECORDING_BOT_BACKSTOP_CRON_PATTERN } from 'src/logic-functions/constants/recall-recording-bot-backstop-cron-pattern';
import { shouldRunRecallRecordingBotBackstopAt } from 'src/logic-functions/constants/should-run-recall-recording-bot-backstop-at';
import { getRecallRecordingBotBackstopIntervalMinutes } from 'src/logic-functions/utils/get-recall-recording-bot-backstop-interval-minutes.util';
import { reconcileRecallRecordingBotForCalendarEventIds } from 'src/logic-functions/utils/reconcile-recall-recording-bot.util';

const TWENTY_PAGE_SIZE = 100;
const BACKSTOP_LOOKBACK_HOURS = 4;
const BACKSTOP_LOOKAHEAD_HOURS = 24;

const handler = async (): Promise<object> => {
  const now = new Date();
  const intervalMinutes =
    await getRecallRecordingBotBackstopIntervalMinutes();

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
  const calendarEventIds: string[] = [];
  let hasNextPage = true;
  let afterCursor: string | undefined;

  while (hasNextPage) {
    const queryArgs: Record<string, unknown> = {
      filter: {
        startsAt: {
          gte: lowerBound,
          lte: upperBound,
        },
      },
      first: TWENTY_PAGE_SIZE,
    };

    if (afterCursor !== undefined) {
      queryArgs.after = afterCursor;
    }

    const queryResult = await client.query({
      calendarEvents: {
        __args: queryArgs,
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
    const connection = queryResult.calendarEvents;

    for (const edge of connection?.edges ?? []) {
      calendarEventIds.push(edge.node.id);
    }

    hasNextPage = connection?.pageInfo?.hasNextPage ?? false;
    afterCursor = connection?.pageInfo?.endCursor ?? undefined;

    if (afterCursor === undefined) {
      hasNextPage = false;
    }
  }

  return [...new Set(calendarEventIds)].sort((firstId, secondId) =>
    firstId.localeCompare(secondId),
  );
};

export default defineLogicFunction({
  universalIdentifier: BACKSTOP_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-recall-recording-bot-backstop',
  description:
    'Periodically reconciles upcoming calendar events as a backstop for missed event triggers.',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: RECALL_RECORDING_BOT_BACKSTOP_CRON_PATTERN,
  },
});
