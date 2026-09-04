import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { findCallRecordingMediaState } from 'src/logic-functions/utils/find-call-recording-media-state.util';

export type ResolveFathomMediaImportTargetResult =
  | { status: 'proceed' }
  | { status: 'skipped'; reason: string };

// Job payloads can carry a forged recording id, so the recording to download is
// taken from the CallRecording's own externalRecordingId rather than the payload.
// The already-imported check also collapses the repeats a retried backfill batch
// enqueues; it cannot collapse two chains started while the first is still in
// flight, which costs a duplicate transfer but converges on the same media.
export const resolveFathomMediaImportTarget = async ({
  coreApiClient,
  callRecordingId,
  recordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
  recordingId: number;
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

  if (mediaState.externalRecordingId !== String(recordingId)) {
    return {
      status: 'skipped',
      reason: 'call recording belongs to another Fathom recording',
    };
  }

  if (mediaState.hasVideo || mediaState.hasAudio) {
    return { status: 'skipped', reason: 'media already imported' };
  }

  return { status: 'proceed' };
};
