import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { toErrorMessage } from 'src/utils/to-error-message';

type CallRecordingForSummary = {
  title: string | undefined;
  transcript: unknown;
  hasSummary: boolean;
};

export const findCallRecordingForSummaryOrThrow = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}): Promise<CallRecordingForSummary | undefined> => {
  const queryResult = await coreApiClient
    .query({
      callRecordings: {
        __args: { filter: { id: { eq: callRecordingId } }, first: 1 },
        edges: {
          node: {
            id: true,
            title: true,
            transcript: true,
            summary: { markdown: true },
          },
        },
      },
    })
    .catch((error: unknown) => {
      throw new RetryableLogicFunctionError(
        `Could not read call recording ${callRecordingId} to summarize it: ${toErrorMessage(error)}`,
      );
    });

  const node = queryResult.callRecordings?.edges?.[0]?.node;

  if (!isDefined(node)) {
    return undefined;
  }

  return {
    title: isNonEmptyString(node.title) ? node.title : undefined,
    transcript: node.transcript,
    hasSummary: isNonEmptyString(node.summary?.markdown?.trim()),
  };
};
