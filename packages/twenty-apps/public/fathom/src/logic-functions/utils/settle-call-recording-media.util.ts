import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { findCallRecordingMediaState } from 'src/logic-functions/utils/find-call-recording-media-state.util';
import { resolveCallRecordingStatus } from 'src/logic-functions/utils/resolve-call-recording-status.util';
import { updateCallRecordingMedia } from 'src/logic-functions/utils/update-call-recording-media.util';

// Every media outcome ends here, imported or unavailable, which is what releases
// the recording from PROCESSING. The transcript is re-read rather than carried
// from the start of the job: a download takes minutes, and the transcript can
// land in the meantime.
export const settleCallRecordingMedia = async ({
  coreApiClient,
  callRecordingId,
  fields,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
  fields: Pick<
    CallRecordingSyncFields,
    'video' | 'audio' | 'fathomMediaFailureReason'
  >;
}): Promise<void> => {
  const mediaState = await findCallRecordingMediaState({
    coreApiClient,
    callRecordingId,
  });

  if (!isDefined(mediaState)) {
    return;
  }

  await updateCallRecordingMedia({
    coreApiClient,
    callRecordingId,
    fields: {
      ...fields,
      status: resolveCallRecordingStatus({
        hasTranscript: mediaState.hasTranscript,
        isMediaSettled: true,
      }),
    },
  });
};
