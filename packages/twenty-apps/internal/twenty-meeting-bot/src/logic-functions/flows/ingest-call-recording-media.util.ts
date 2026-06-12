import { isUndefined } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-audio-field-universal-identifier';
import { CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-video-field-universal-identifier';
import { extractRecallMediaUrls } from 'src/logic-functions/recall-api/extract-recall-media-urls.util';
import { getRecallRecording } from 'src/logic-functions/recall-api/get-recall-recording.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/data/update-call-recording.util';

type CallRecordingMediaUpdateFields = Pick<
  CallRecordingUpdateFields,
  'audio' | 'video'
>;

// Inner bound per artifact — the runtime's timeoutSeconds is the outer kill
// switch; a stalled transfer must not consume the whole function budget.
const MEDIA_DOWNLOAD_TIMEOUT_MS = 120_000;

// Failed artifacts are omitted; the reconciler retries them with fresh URLs.
export const ingestCallRecordingMedia = async ({
  callRecordingId,
  externalRecordingId,
  hasAudio,
  hasVideo,
}: {
  callRecordingId: string;
  externalRecordingId: string;
  hasAudio: boolean;
  hasVideo: boolean;
}): Promise<CallRecordingMediaUpdateFields> => {
  if (hasAudio && hasVideo) {
    return {};
  }

  const recordingResult = await getRecallRecording({ externalRecordingId });

  if (!recordingResult.ok) {
    console.warn(
      `[twenty-meeting-bot] failed to fetch Recall recording ${externalRecordingId} while ingesting media for call recording ${callRecordingId}: ${recordingResult.errorMessage}`,
    );

    return {};
  }

  const mediaUrls = extractRecallMediaUrls(recordingResult.recording);
  const metadataClient = new MetadataApiClient();
  const updateFields: CallRecordingMediaUpdateFields = {};

  if (!hasVideo && !isUndefined(mediaUrls.videoUrl)) {
    const video = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.videoUrl,
      fileName: 'video.mp4',
      fieldMetadataUniversalIdentifier:
        CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
    });

    if (!isUndefined(video)) {
      updateFields.video = video;
    }
  }

  if (!hasAudio && !isUndefined(mediaUrls.audioUrl)) {
    const audio = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.audioUrl,
      fileName: 'audio.mp3',
      fieldMetadataUniversalIdentifier:
        CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER,
    });

    if (!isUndefined(audio)) {
      updateFields.audio = audio;
    }
  }

  return updateFields;
};

const ingestMediaArtifact = async ({
  callRecordingId,
  metadataClient,
  url,
  fileName,
  fieldMetadataUniversalIdentifier,
}: {
  callRecordingId: string;
  metadataClient: InstanceType<typeof MetadataApiClient>;
  url: string;
  fileName: string;
  fieldMetadataUniversalIdentifier: string;
}): Promise<{ fileId: string; label: string }[] | undefined> => {
  try {
    const { buffer, contentType } = await downloadMediaFile(url);
    const uploadedFile = await metadataClient.uploadFile(
      buffer,
      fileName,
      contentType,
      fieldMetadataUniversalIdentifier,
    );

    return [{ fileId: uploadedFile.id, label: fileName }];
  } catch (error) {
    console.warn(
      `[twenty-meeting-bot] failed to ingest ${fileName} for call recording ${callRecordingId}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};

const downloadMediaFile = async (
  url: string,
): Promise<{ buffer: Buffer; contentType: string }> => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(MEDIA_DOWNLOAD_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`download failed with status ${response.status}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType:
      response.headers.get('content-type') ?? 'application/octet-stream',
  };
};
