import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

export type CallRecordingMediaState = {
  externalRecordingId: string | undefined;
  hasVideo: boolean;
  hasAudio: boolean;
  failureReason: string | undefined;
};

type CallRecordingMediaStateNode = {
  externalRecordingId?: string | null;
  video?: { fileId?: string | null }[] | null;
  audio?: { fileId?: string | null }[] | null;
  fathomMediaFailureReason?: string | null;
};

export const findCallRecordingMediaState = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}): Promise<CallRecordingMediaState | undefined> => {
  const queryResult = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: callRecordingId } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          externalRecordingId: true,
          video: { fileId: true },
          audio: { fileId: true },
          fathomMediaFailureReason: true,
        },
      },
    },
  });
  const node = queryResult.callRecordings?.edges?.[0]?.node as
    | CallRecordingMediaStateNode
    | null
    | undefined;

  if (!isDefined(node)) {
    return undefined;
  }

  return {
    externalRecordingId: isNonEmptyString(node.externalRecordingId)
      ? node.externalRecordingId
      : undefined,
    hasVideo: isNonEmptyArray(node.video),
    hasAudio: isNonEmptyArray(node.audio),
    failureReason: isNonEmptyString(node.fathomMediaFailureReason)
      ? node.fathomMediaFailureReason
      : undefined,
  };
};
