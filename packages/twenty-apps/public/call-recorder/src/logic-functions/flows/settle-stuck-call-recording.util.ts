import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { completeCallRecordingImport } from 'src/logic-functions/data/complete-call-recording-import.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { updateNonTerminalCallRecordingState } from 'src/logic-functions/data/update-non-terminal-call-recording-state.util';
import { buildEmptyTranscriptMarker } from 'src/logic-functions/domain/build-empty-transcript-marker.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';

export type SettleStuckCallRecordingOutcome = 'completed' | 'failed';

export const settleStuckCallRecording = async (
  client: CoreApiClient,
  callRecording: {
    id: string;
    transcript: unknown;
    audio: FilesFieldValue | undefined;
    video: FilesFieldValue | undefined;
  },
): Promise<SettleStuckCallRecordingOutcome> => {
  const hasImportedMedia =
    isNonEmptyArray(callRecording.audio) ||
    isNonEmptyArray(callRecording.video);

  if (!hasImportedMedia) {
    await updateNonTerminalCallRecordingState(client, {
      callRecordingId: callRecording.id,
      data: {
        status: CallRecordingStatus.FAILED,
        callRecorderFailureReason: 'recording_import_expired',
      },
    });

    return 'failed';
  }

  const transcriptMarker = parseTranscriptMarker(callRecording.transcript);
  const isTranscriptMissing =
    isUndefined(callRecording.transcript) ||
    transcriptMarker?.status === 'PENDING';

  if (isTranscriptMissing) {
    await updateCallRecording(client, {
      id: callRecording.id,
      data: {
        transcript: buildEmptyTranscriptMarker({
          recallTranscriptId: transcriptMarker?.recallTranscriptId ?? null,
        }),
      },
    });
  }

  await completeCallRecordingImport(client, { id: callRecording.id });

  return 'completed';
};
