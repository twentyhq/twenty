import { type CoreApiClient } from 'twenty-client-sdk/core';
import { getRecallRecording } from 'src/logic-functions/recall-api/utils/getRecallRecording';
import { normalizeRecallTimestamp } from 'src/logic-functions/recall-api/utils/normalizeRecallTimestamp';
import { getString } from 'src/logic-functions/utils/getString';
import { isDesktopAudioRecording } from 'src/logic-functions/domain/utils/isDesktopAudioRecording';
import { type SyncableCallRecording } from 'src/logic-functions/types/SyncableCallRecording';
import { updateCallRecording } from 'src/logic-functions/data/utils/updateCallRecording';

export const hydrateDesktopRecordingTimestamps = async (
  client: CoreApiClient,
  recording: SyncableCallRecording,
): Promise<void> => {
  if (
    !isDesktopAudioRecording(recording.companionSession) ||
    !recording.externalRecordingId ||
    (recording.startedAt && recording.endedAt)
  )
    return;
  const result = await getRecallRecording({
    externalRecordingId: recording.externalRecordingId,
  });
  if (!result.ok) throw new Error('Recall recording is not available yet.');
  const startedAt =
    recording.startedAt ??
    normalizeRecallTimestamp(getString(result.recording.started_at));
  const endedAt =
    recording.endedAt ??
    normalizeRecallTimestamp(getString(result.recording.completed_at));
  await updateCallRecording(client, {
    id: recording.id,
    data: {
      ...(startedAt ? { startedAt } : {}),
      ...(endedAt ? { endedAt } : {}),
    },
  });
  recording.startedAt = startedAt;
  recording.endedAt = endedAt;
};
