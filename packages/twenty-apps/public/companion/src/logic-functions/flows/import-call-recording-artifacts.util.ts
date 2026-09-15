import { hydrateDesktopRecordingTimestamps } from 'src/logic-functions/flows/recover-desktop-recordings.util';
import { isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  claimCallRecordingArtifactsImport,
  releaseCallRecordingArtifactsImportClaim,
} from 'src/logic-functions/data/claim-call-recording-artifacts-import.util';
import {
  syncCallRecording,
  type SyncableCallRecording,
} from 'src/logic-functions/flows/sync-call-recording.util';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';
import { getString } from 'src/logic-functions/utils/get-string.util';
import { isDesktopAudioRecording } from 'src/logic-functions/domain/is-desktop-audio-recording.util';
import { getOwnedDesktopUpload } from 'src/logic-functions/recall-api/get-owned-desktop-upload.util';

type CallRecordingForArtifactsImport = SyncableCallRecording & {
  externalBotId: string | undefined;
};

type CallRecordingForArtifactsImportNode = {
  id?: string | null;
  status?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  companionSession?: unknown;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
  companionFailureReason?: string | null;
  transcript?: unknown;
  audio?: FilesFieldValue | null;
  video?: FilesFieldValue | null;
};

export type ImportCallRecordingArtifactsResult =
  | {
      status: 'imported';
      callRecordingId: string;
      outcome: 'call-recording-artifacts-imported';
    }
  | {
      status: 'skipped';
      callRecordingId: string;
      reason: string;
    };

// Job payloads can carry forged provider ids, so imports resolve only from the
// CallRecording's upload after verifying its ownership with Recall.
export const importCallRecordingArtifacts = async ({
  client,
  request,
}: {
  client: CoreApiClient;
  request: CallRecordingArtifactsImportRequest;
}): Promise<ImportCallRecordingArtifactsResult> => {
  let callRecording = await findCallRecordingForArtifactsImport(
    client,
    request.callRecordingId,
  );

  if (
    isUndefined(callRecording) ||
    !isDesktopAudioRecording(callRecording.companionSession)
  ) {
    return {
      status: 'skipped',
      callRecordingId: request.callRecordingId,
      reason: 'no matching call recording',
    };
  }

  // Svix redelivers a webhook to several workers at once; the lease ensures only
  // one performs the provider transcript request and media upload. The lease clock
  // is wall-clock, not request.requestedAt, so a retry of the same delivery still
  // measures real elapsed time and can reclaim a lease left behind by a crash.
  const claimedAt = new Date();
  const claimedImport = await claimCallRecordingArtifactsImport(client, {
    callRecordingId: callRecording.id,
    now: claimedAt,
  });

  if (!claimedImport) {
    return {
      status: 'skipped',
      callRecordingId: callRecording.id,
      reason: 'artifact import already in progress',
    };
  }

  try {
    // A worker may have finished between our first read and acquiring the lease.
    callRecording = await findCallRecordingForArtifactsImport(
      client,
      request.callRecordingId,
    );
    if (!callRecording)
      return {
        status: 'skipped',
        callRecordingId: request.callRecordingId,
        reason: 'recording removed',
      };
    const upload = await getOwnedDesktopUpload(callRecording);
    if (
      !upload ||
      upload.status.code !== 'complete' ||
      !upload.recording_id ||
      upload.recording_id !== callRecording.externalRecordingId
    ) {
      return {
        status: 'skipped',
        callRecordingId: callRecording.id,
        reason: 'recording does not match the owned desktop upload',
      };
    }
    await hydrateDesktopRecordingTimestamps(client, callRecording);
    const syncResult = await syncCallRecording({
      client,
      callRecording,
      requestedAt: request.requestedAt,
    });

    if (!syncResult.updated) {
      return {
        status: 'skipped',
        callRecordingId: callRecording.id,
        reason: 'no artifact updates',
      };
    }

    return {
      status: 'imported',
      callRecordingId: request.callRecordingId,
      outcome: 'call-recording-artifacts-imported',
    };
  } finally {
    await releaseCallRecordingArtifactsImportClaim(client, {
      callRecordingId: request.callRecordingId,
      claimedAt,
    });
  }
};

const findCallRecordingForArtifactsImport = async (
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
          companionSession: true,
          externalBotId: true,
          externalRecordingId: true,
          companionFailureReason: true,
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
    companionSession: node.companionSession,
    status: getString(node.status),
    startedAt: getString(node.startedAt),
    endedAt: getString(node.endedAt),
    externalBotId: getString(node.externalBotId),
    externalRecordingId: getString(node.externalRecordingId),
    companionFailureReason: getString(node.companionFailureReason),
    transcript: node.transcript ?? undefined,
    audio: node.audio ?? undefined,
    video: node.video ?? undefined,
  };
};
