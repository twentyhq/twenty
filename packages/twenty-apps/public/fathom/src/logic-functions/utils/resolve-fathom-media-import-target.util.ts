import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { findCallRecordingMediaState } from 'src/logic-functions/utils/find-call-recording-media-state.util';
import { isFathomMediaSettled } from 'src/logic-functions/utils/is-fathom-media-settled.util';
import { type FathomMediaUploadCheckpoint } from 'src/logic-functions/types/fathom-media-upload-checkpoint.type';

export type ResolveFathomMediaImportTargetResult =
  | {
      status: 'proceed';
      connectedAccountId: string;
      recordingId: number;
      downloadId: string | undefined;
      uploadCheckpoint: FathomMediaUploadCheckpoint | undefined;
    }
  | { status: 'skipped'; reason: string };

export const resolveFathomMediaImportTarget = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}): Promise<ResolveFathomMediaImportTargetResult> => {
  const mediaState = await findCallRecordingMediaState({
    coreApiClient,
    callRecordingId,
  });

  if (!isDefined(mediaState)) {
    return { status: 'skipped', reason: 'no matching call recording' };
  }

  if (!isNonEmptyString(mediaState.externalRecordingId)) {
    return { status: 'skipped', reason: 'call recording has no Fathom id' };
  }

  const recordingId = Number(mediaState.externalRecordingId);

  if (!Number.isSafeInteger(recordingId) || recordingId <= 0) {
    return {
      status: 'skipped',
      reason: 'call recording has an invalid Fathom id',
    };
  }

  if (isFathomMediaSettled(mediaState)) {
    return {
      status: 'skipped',
      reason:
        mediaState.hasVideo || mediaState.hasAudio
          ? 'media already imported'
          : `media unavailable: ${mediaState.failureReason}`,
    };
  }

  if (!isNonEmptyString(mediaState.connectedAccountId)) {
    return {
      status: 'skipped',
      reason: 'call recording has no Fathom connected account',
    };
  }

  return {
    status: 'proceed',
    connectedAccountId: mediaState.connectedAccountId,
    recordingId,
    downloadId: mediaState.downloadId,
    uploadCheckpoint: mediaState.uploadCheckpoint,
  };
};
