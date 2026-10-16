import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';

import { FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT } from 'src/logic-functions/constants/fireflies-backfill-batch-retry-limit.constant';
import {
  BACKFILL_CALENDAR_PARTICIPANTS_BATCH_UNIVERSAL_IDENTIFIER,
  SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { getCurrentApplicationId } from 'src/logic-functions/utils/get-current-application-id.util';

const batchSchema = z.object({ after: z.string().optional() });

export const backfillCalendarParticipantsBatchHandler = async (
  payload: unknown,
): Promise<void> => {
  const { after } = batchSchema.parse(payload);
  const client = new CoreApiClient({ runAs: 'application' });
  const applicationId = getCurrentApplicationId();

  try {
    const result = await client.query({
      callRecordings: {
        __args: {
          filter: {
            applicationId: { eq: applicationId },
            calendarEventId: { is: 'NOT_NULL' },
          },
          first: 100,
          orderBy: [{ id: 'AscNullsLast' }],
          ...(isNonEmptyString(after) ? { after } : {}),
        },
        pageInfo: { hasNextPage: true, endCursor: true },
        edges: { node: { id: true } },
      },
    });
    const page = result.callRecordings;
    if (!isDefined(page)) {
      throw new Error('Calendar participant backfill returned no connection');
    }
    const nextCursor = page.pageInfo?.endCursor;
    if (
      page.pageInfo?.hasNextPage &&
      (!isNonEmptyString(nextCursor) || nextCursor === after)
    ) {
      throw new Error(
        'Calendar participant backfill returned an invalid cursor',
      );
    }
    const recordingPayloads = (page.edges ?? []).map(({ node }) => ({
      recordId: node.id,
    }));
    if (isNonEmptyArray(recordingPayloads)) {
      await enqueueJobs({
        logicFunctionUniversalIdentifier:
          SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads: recordingPayloads,
        retryLimit: FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT,
      });
    }
    if (page.pageInfo?.hasNextPage) {
      await enqueueJobs({
        logicFunctionUniversalIdentifier:
          BACKFILL_CALENDAR_PARTICIPANTS_BATCH_UNIVERSAL_IDENTIFIER,
        payloads: [{ after: nextCursor }],
        retryLimit: FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT,
      });
    }
  } catch (error) {
    throw new RetryableLogicFunctionError(
      `Calendar participant backfill failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_CALENDAR_PARTICIPANTS_BATCH_UNIVERSAL_IDENTIFIER,
  name: 'backfill-calendar-participants-batch',
  description:
    'Enqueues one page of recording participants and the next backfill page.',
  timeoutSeconds: 30,
  handler: backfillCalendarParticipantsBatchHandler,
});
