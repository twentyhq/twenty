import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { callRecordingFieldStateQueryResultSchema } from 'src/logic-functions/schemas/call-recording-field-state-query-result.schema';
import { type CallRecordingFieldState } from 'src/logic-functions/types/call-recording-field-state.type';

export const findCallRecordingFieldStatesOrThrow = async ({
  coreApiClient,
  callRecordingIds,
}: {
  coreApiClient: CoreApiClient;
  callRecordingIds: string[];
}): Promise<Map<string, CallRecordingFieldState>> => {
  const fieldStateQueryResult = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: { id: { in: callRecordingIds } },
        first: callRecordingIds.length,
      },
      edges: {
        node: {
          id: true,
          status: true,
          transcript: true,
          summary: {
            markdown: true,
          },
        },
      },
    },
  });
  const parsedFieldStateQueryResult =
    callRecordingFieldStateQueryResultSchema.parse(fieldStateQueryResult);
  const callRecordingFieldStates = new Map<string, CallRecordingFieldState>();

  for (const edge of parsedFieldStateQueryResult.callRecordings?.edges ?? []) {
    const node = edge?.node;

    if (!isDefined(node)) {
      continue;
    }

    callRecordingFieldStates.set(node.id, {
      isTranscriptFilled: isDefined(node.transcript),
      isSummaryFilled: isNonEmptyString(node.summary?.markdown?.trim()),
      status: node.status,
    });
  }

  return callRecordingFieldStates;
};
