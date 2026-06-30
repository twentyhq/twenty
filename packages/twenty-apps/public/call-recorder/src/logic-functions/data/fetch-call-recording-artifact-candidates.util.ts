import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export type CallRecordingArtifactCandidate = {
  id: string;
  status: string | undefined;
  startedAt: string | undefined;
  endedAt: string | undefined;
  externalRecordingId: string | undefined;
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
};

type CallRecordingArtifactCandidateNode = {
  id: string;
  status?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  externalRecordingId?: string | null;
  transcript?: unknown;
  audio?: FilesFieldValue | null;
  video?: FilesFieldValue | null;
};

export const fetchCallRecordingArtifactCandidates = async ({
  client,
  first,
  artifactKind,
}: {
  client: CoreApiClient;
  first: number;
  artifactKind: 'audio' | 'transcript' | 'video';
}): Promise<CallRecordingArtifactCandidate[]> => {
  const filter: Record<string, unknown> = {
    recordingRequestStatus: {
      eq: CallRecordingRequestStatus.REQUESTED,
    },
    status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
    externalRecordingId: { is: 'NOT_NULL' },
  };

  filter[artifactKind] = { is: 'NULL' };

  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter,
        first,
        orderBy: [{ updatedAt: 'AscNullsLast' }],
      },
      edges: {
        node: {
          id: true,
          status: true,
          startedAt: true,
          endedAt: true,
          externalRecordingId: true,
          transcript: true,
          audio: { fileId: true },
          video: { fileId: true },
        },
      },
    },
  });

  return (
    (queryResult.callRecordings?.edges ?? []) as Array<{
      node: CallRecordingArtifactCandidateNode;
    }>
  ).map(({ node }) => ({
    id: node.id,
    status: node.status ?? undefined,
    startedAt: node.startedAt ?? undefined,
    endedAt: node.endedAt ?? undefined,
    externalRecordingId: isNonEmptyString(node.externalRecordingId)
      ? node.externalRecordingId
      : undefined,
    transcript: node.transcript ?? undefined,
    audio: node.audio ?? undefined,
    video: node.video ?? undefined,
  }));
};
