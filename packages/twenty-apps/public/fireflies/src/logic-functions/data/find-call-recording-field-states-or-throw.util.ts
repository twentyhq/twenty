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
  const [summaryStateQueryResult, transcriptStateQueryResult] =
    await Promise.all([
      coreApiClient.query({
        callRecordings: {
          __args: {
            filter: { id: { in: callRecordingIds } },
            first: callRecordingIds.length,
          },
          edges: {
            node: {
              id: true,
              status: true,
              summary: {
                markdown: true,
              },
            },
          },
        },
      }),
      coreApiClient.query({
        callRecordings: {
          __args: {
            filter: {
              id: { in: callRecordingIds },
              transcript: { is: 'NOT_NULL' },
            },
            first: callRecordingIds.length,
          },
          edges: {
            node: {
              id: true,
            },
          },
        },
      }),
    ]);
  const parsedSummaryStateQueryResult =
    callRecordingFieldStateQueryResultSchema.parse(summaryStateQueryResult);
  const parsedTranscriptStateQueryResult =
    callRecordingFieldStateQueryResultSchema.parse(transcriptStateQueryResult);
  const callRecordingIdsWithTranscript = new Set(
    (parsedTranscriptStateQueryResult.callRecordings?.edges ?? [])
      .map((edge) => edge?.node?.id)
      .filter(isDefined),
  );
  const callRecordingFieldStates = new Map<string, CallRecordingFieldState>();

  for (const edge of parsedSummaryStateQueryResult.callRecordings?.edges ??
    []) {
    const node = edge?.node;

    if (!isDefined(node)) {
      continue;
    }

    callRecordingFieldStates.set(node.id, {
      isTranscriptFilled: callRecordingIdsWithTranscript.has(node.id),
      isSummaryFilled: isNonEmptyString(node.summary?.markdown?.trim()),
      status: node.status,
    });
  }

  return callRecordingFieldStates;
};
