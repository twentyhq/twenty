import { isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SyncableCallRecording } from 'src/logic-functions/flows/sync-call-recording.util';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { getString } from 'src/logic-functions/utils/get-string.util';

export type CallRecordingForArtifactsImport = SyncableCallRecording & {
  externalBotId: string | undefined;
};

type CallRecordingForArtifactsImportNode = {
  id?: string | null;
  status?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
  callRecorderFailureReason?: string | null;
  transcript?: unknown;
  audio?: FilesFieldValue | null;
  video?: FilesFieldValue | null;
};

export const findCallRecordingForArtifactsImport = async (
  client: CoreApiClient,
  callRecordingId: string,
): Promise<CallRecordingForArtifactsImport | undefined> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: callRecordingId } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          status: true,
          startedAt: true,
          endedAt: true,
          externalBotId: true,
          externalRecordingId: true,
          callRecorderFailureReason: true,
          transcript: true,
          audio: { fileId: true },
          video: { fileId: true },
        },
      },
    },
  });

  const node = queryResult.callRecordings?.edges?.[0]?.node as
    | CallRecordingForArtifactsImportNode
    | null
    | undefined;
  const id = getString(node?.id);

  if (isUndefined(node) || isNull(node) || isUndefined(id)) {
    return undefined;
  }

  return {
    id,
    status: getString(node.status),
    startedAt: getString(node.startedAt),
    endedAt: getString(node.endedAt),
    externalBotId: getString(node.externalBotId),
    externalRecordingId: getString(node.externalRecordingId),
    callRecorderFailureReason: getString(node.callRecorderFailureReason),
    transcript: node.transcript ?? undefined,
    audio: node.audio ?? undefined,
    video: node.video ?? undefined,
  };
};
