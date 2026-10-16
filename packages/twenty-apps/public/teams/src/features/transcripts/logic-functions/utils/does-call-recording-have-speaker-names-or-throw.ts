import { isDefined } from 'twenty-sdk/utils';
import { type CoreApiClient } from 'twenty-client-sdk/core';

// jsonb::text is canonical and escapes quotes inside strings, so only a non-null name matches.
const TRANSCRIPT_WITH_SPEAKER_NAME_PATTERN = '%"participant": {"name": "%';

export const doesCallRecordingHaveSpeakerNamesOrThrow = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}): Promise<boolean> => {
  const result: {
    callRecordings?: { edges?: { node: { id: string } }[] };
  } = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          transcript: { like: TRANSCRIPT_WITH_SPEAKER_NAME_PATTERN },
        },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  });

  return isDefined(result.callRecordings?.edges?.[0]?.node);
};
